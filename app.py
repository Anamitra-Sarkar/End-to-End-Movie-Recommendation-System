import pickle
import os
import gc
import logging
import numpy as np
import pandas as pd
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Allow Vercel and Localhost (for testing)
CORS(app, resources={r"/*": {"origins": [
    "https://end-to-end-movie-recommendation-sys.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
]}})

# Get TMDB API key from environment variable
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
if not TMDB_API_KEY:
    logger.error("CRITICAL: TMDB_API_KEY environment variable is not set. API functionality will be limited.")
else:
    logger.info("TMDB_API_KEY loaded successfully from environment")

# Loading the dataset and the trained model
try:
    clf = pickle.load(open("./Artifacts/nlp_model.pkl", 'rb'))
    vectorizer = pickle.load(open("./Artifacts/tranform.pkl", 'rb'))
    logger.info("Models loaded successfully")
    # Force garbage collection to free temporary memory from pickle loading
    gc.collect()
    logger.info("Garbage collection completed after model loading")
except Exception as e:
    logger.error(f"Error loading models: {e}")
    clf = None
    vectorizer = None

# Global variables for similarity data
data = None
similarity = None

def create_similarity():
    """Create similarity matrix using count vectorizer and cosine similarity"""
    global data, similarity
    try:
        # Use relative path that works in production
        data_path = os.path.join(os.path.dirname(__file__), 'Artifacts', 'main_data.csv')
        data = pd.read_csv(data_path)
        cv = CountVectorizer()
        count_matrix = cv.fit_transform(data['comb']) 
        similarity = cosine_similarity(count_matrix)
        logger.info("Similarity matrix created successfully")
        # Force garbage collection to free temporary memory
        gc.collect()
        logger.info("Garbage collection completed after similarity matrix creation")
        return data, similarity
    except Exception as e:
        logger.error(f"Error creating similarity: {e}")
        return None, None

def rcmd(m):
    """Get movie recommendations based on similarity"""
    global data, similarity
    m = m.lower()
    try:
        if data is None or similarity is None:
            create_similarity()
        
        if data is None:
            return 'Error: Unable to load movie database'
            
        if m not in data['movie_title'].unique():
            return 'Sorry! The movie you requested is not in our database. Please check the spelling or try with some other movies'
        else:
            i = data.loc[data['movie_title']==m].index[0]
            lst = list(enumerate(similarity[i]))
            lst = sorted(lst, key=lambda x: x[1], reverse=True)
            lst = lst[1:11]  # excluding first item since it is the requested movie itself
            l = []
            for i in range(len(lst)):
                a = lst[i][0]
                l.append(data['movie_title'][a])
            return l
    except Exception as e:
        logger.error(f"Error in recommendation: {e}")
        return f'Error: {str(e)}'

def get_suggestions():
    """Get list of all movie titles for autocomplete"""
    global data
    try:
        if data is None:
            data_path = os.path.join(os.path.dirname(__file__), 'Artifacts', 'main_data.csv')
            data = pd.read_csv(data_path)
        return list(data['movie_title'].str.capitalize())
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        return []

# Initialize similarity matrix at module load time (for gunicorn workers)
logger.info("Initializing similarity matrix at startup...")
try:
    create_similarity()
    logger.info(f"Startup initialization complete. Loaded {len(data) if data is not None else 0} movies.")
except Exception as e:
    logger.error(f"Error during startup initialization: {e}")

@app.route("/")
@app.route("/home")
def home():
    """Root endpoint - returns API status and available endpoints documentation"""
    return jsonify({
        "status": "active",
        "message": "Backend is live",
        "version": "2.0.0",
        "endpoints": {
            "health": "GET /health (lightweight keep-alive)",
            "recommendations": "POST /recommend",
            "similarity": "POST /similarity",
            "suggestions": "GET /api/suggestions"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Lightweight keep-alive endpoint for uptime monitoring"""
    return jsonify({"status": "active", "platform": "Hugging Face Spaces"}), 200

# Browsing Data
movies_data = None

def load_browsing_data():
    """Load and preprocess movies.csv for browsing"""
    global movies_data
    try:
        path = os.path.join(os.path.dirname(__file__), 'Artifacts', 'movies.csv')
        df = pd.read_csv(path)
        
        # Preprocess
        df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce')
        df['year'] = df['release_date'].dt.year.fillna(0).astype(int)
        df['vote_average'] = df['vote_average'].fillna(0)
        df['popularity'] = df['popularity'].fillna(0)
        df['genres'] = df['genres'].fillna('')
        
        movies_data = df
        logger.info(f"Browsing data loaded: {len(df)} movies")
    except Exception as e:
        logger.error(f"Error loading browsing data: {e}")

# Initialize browsing data on startup
try:
    load_browsing_data()
except Exception as e:
    logger.error(f"Startup browsing data error: {e}")

@app.route("/api/movies", methods=["GET"])
def get_movies():
    """Get movies with filtering, sorting, and pagination"""
    global movies_data
    if movies_data is None:
        load_browsing_data()
        if movies_data is None:
            return jsonify({'error': 'Data not available'}), 500
            
    try:
        # Parameters
        search = request.args.get('search', '').lower()
        genre = request.args.get('genre', '')
        year = request.args.get('year', '')
        rating = request.args.get('rating', '') # format: "7+" -> 7.0
        sort = request.args.get('sort', 'popularity.desc')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Filtering
        filtered = movies_data.copy()
        
        if search:
            filtered = filtered[filtered['title'].str.lower().str.contains(search, na=False)]
            
        if genre and genre != 'All':
            filtered = filtered[filtered['genres'].str.contains(genre, na=False, case=False)]
            
        if year and year != 'Any':
            try:
                target_year = int(year)
                filtered = filtered[filtered['year'] == target_year]
            except:
                pass # Ignore invalid year
                
        if rating and rating != 'Any':
            try:
                min_rating = float(rating.replace('+', '').strip())
                filtered = filtered[filtered['vote_average'] >= min_rating]
            except:
                pass
                
        # Sorting
        if sort == 'popularity.desc':
            filtered = filtered.sort_values('popularity', ascending=False)
        elif sort == 'vote_average.desc':
            filtered = filtered.sort_values('vote_average', ascending=False)
        elif sort == 'release_date.desc':
            filtered = filtered.sort_values('release_date', ascending=False)
            
        # Pagination
        total = len(filtered)
        start = (page - 1) * limit
        end = start + limit
        
        results = filtered.iloc[start:end].fillna('')
        
        # Format response
        movies_list = []
        for _, row in results.iterrows():
            movie_id_val = int(row['id']) if row['id'] != '' else 0
            poster = fetch_poster(row['title'], movie_id_val)
            movies_list.append({
                'id': int(row['id']) if row['id'] != '' else 0,
                'title': str(row['title']),
                'poster': poster,
                'year': int(row['year']) if row['year'] != '' else 0,
                'rating': float(row['vote_average']) if row['vote_average'] != '' else 0.0,
                'genre': str(row['genres']).split(' ')[0] if row['genres'] else 'Unknown'
            })
            
        return jsonify({
            'movies': movies_list,
            'total': total,
            'page': page,
            'pages': (total // limit) + (1 if total % limit > 0 else 0)
        })
        
    except Exception as e:
        logger.error(f"Error in get_movies: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/movie/<int:movie_id>", methods=["GET"])
def get_movie_details(movie_id):
    """Get single movie details by ID"""
    global movies_data
    if movies_data is None:
        load_browsing_data()
        
    try:
        # Find movie by ID
        movie = movies_data[movies_data['id'] == movie_id]
        
        if len(movie) == 0:
            return jsonify({'error': 'Movie not found'}), 404
            
        row = movie.iloc[0].fillna('')
        movie_id_val = int(row['id']) if row['id'] != '' else 0
        poster = fetch_poster(row['title'], movie_id_val)
        
        return jsonify({
            'id': int(row['id']) if row['id'] != '' else 0,
            'title': str(row['title']),
            'poster': poster,
            'year': int(row['year']) if row['year'] != '' else 0,
            'rating': float(row['vote_average']) if row['vote_average'] != '' else 0.0,
            'genres': str(row['genres']).split(' ') if row['genres'] else [],
            'overview': str(row['overview']),
            'tagline': str(row['tagline']),
            'runtime': int(row['runtime']) if row['runtime'] != '' else 0,
            'director': str(row['director']) if row['director'] else 'Unknown',
            'cast': str(row['cast']) if row['cast'] else '[]'
        })
        
    except Exception as e:
        logger.error(f"Error fetching movie {movie_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/suggestions", methods=["GET"])
def get_suggestions_api():
    """API endpoint to get movie suggestions for autocomplete"""
    suggestions = get_suggestions()
    return jsonify({
        'suggestions': suggestions
    })


def fetch_poster(movie_title, movie_id=None):
    """Fetch movie poster URL from TMDB API using movie_id (preferred) or title search.
    
    If movie_id is provided, we can fetch the poster directly, which is faster and more reliable.
    Falls back to title search if movie_id fetch fails.
    """
    if not TMDB_API_KEY:
        # Return a high-quality placeholder with movie initials
        initials = ''.join([word[0].upper() for word in movie_title.split()[:2]]) if movie_title else 'MV'
        return f"https://api.dicebear.com/7.x/initials/svg?seed={initials}&backgroundColor=1a1a2e&textColor=e94560"
    
    # Determine auth method: Bearer Token (JWT) vs API Key (v3)
    headers = {
        "Content-Type": "application/json"
    }
    params = {}
    
    if len(TMDB_API_KEY) > 100: # It's likely a JWT Bearer Token
        headers["Authorization"] = f"Bearer {TMDB_API_KEY}"
    else: # It's likely a v3 API Key
        params["api_key"] = TMDB_API_KEY

    try:
        # Method 1: Direct fetch using TMDB movie_id (most reliable)
        if movie_id and movie_id != 0:
            url = f"https://api.themoviedb.org/3/movie/{movie_id}"
            response = requests.get(url, headers=headers, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                poster_path = data.get('poster_path')
                if poster_path:
                    return f"https://image.tmdb.org/t/p/w500{poster_path}"
        
        # Method 2: Fallback to title search
        url = "https://api.themoviedb.org/3/search/movie"
        search_params = params.copy()
        search_params["query"] = movie_title
        
        response = requests.get(url, headers=headers, params=search_params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('results') and len(data['results']) > 0:
                poster_path = data['results'][0].get('poster_path')
                if poster_path:
                    return f"https://image.tmdb.org/t/p/w500{poster_path}"
        
        # Method 3: Return styled placeholder
        initials = ''.join([word[0].upper() for word in movie_title.split()[:2]]) if movie_title else 'MV'
        return f"https://api.dicebear.com/7.x/initials/svg?seed={initials}&backgroundColor=1a1a2e&textColor=e94560"
    except Exception as e:
        logger.error(f"Error fetching poster for {movie_title}: {e}")
        initials = ''.join([word[0].upper() for word in movie_title.split()[:2]]) if movie_title else 'MV'
        return f"https://api.dicebear.com/7.x/initials/svg?seed={initials}&backgroundColor=1a1a2e&textColor=e94560"

@app.route("/similarity", methods=["POST"])
def similarity_route():
    """Get similar movies based on input"""
    try:
        # Support both form data and JSON input
        if request.is_json:
            movie = request.json.get('name', '') or request.json.get('movie_title', '')
        else:
            movie = request.form.get('name', '')
        
        if not movie:
            return jsonify({'error': 'Movie name is required'}), 400
            
        rc = rcmd(movie)
        if isinstance(rc, str):
            # Error message or not found
            return jsonify({'error': rc}), 404
        else:
            # Success - return list of similar movies
            return jsonify({
                'movies': rc,
                'query': movie
            })
    except Exception as e:
        logger.error(f"Error in similarity route: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/recommend", methods=["POST"])
def recommend():
    """Get movie recommendations with posters.
    
    Accepts JSON: {"movie_title": "Inception"}
    Returns JSON: {"movies": [...], "posters": [...], "query": "..."}
    """
    try:
        # Support both JSON and form data input
        if request.is_json:
            movie_title = request.json.get('movie_title', '')
        else:
            movie_title = request.form.get('movie_title', '') or request.form.get('name', '')
        
        if not movie_title:
            return jsonify({'error': 'movie_title is required'}), 400
        
        # Get similar movies from the recommendation engine
        rc = rcmd(movie_title)
        
        if isinstance(rc, str):
            # Error message or not found
            return jsonify({'error': rc}), 404
        
        # Build response with movie titles
        movies = rc
        
        # Fetch posters server-side to avoid exposing API key to frontend
        posters = []
        for movie in movies:
            poster = fetch_poster(movie)
            posters.append(poster)
        
        # Return the recommendations with posters
        return jsonify({
            'movies': movies,
            'posters': posters,
            'query': movie_title,
            'count': len(movies)
        })
        
    except Exception as e:
        logger.error(f"Error in recommend route: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize similarity matrix on startup
    create_similarity()
    
    # Get port from environment variable for deployment
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host="0.0.0.0", port=port)