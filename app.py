import pickle
import os
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
# Enable CORS for Vercel frontend
CORS(app, resources={r"/*": {"origins": "https://end-to-end-movie-recommendation-sys.vercel.app"}})

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
    """Health check endpoint - returns API status"""
    return jsonify({
        "status": "active",
        "message": "Backend is live",
        "version": "2.0.0",
        "endpoints": {
            "health": "GET /",
            "recommendations": "POST /recommend",
            "similarity": "POST /similarity",
            "suggestions": "GET /api/suggestions"
        }
    })

@app.route("/api/suggestions", methods=["GET"])
def get_suggestions_api():
    """API endpoint to get movie suggestions for autocomplete"""
    suggestions = get_suggestions()
    return jsonify({
        'suggestions': suggestions
    })


def fetch_poster(movie_title):
    """Fetch movie poster URL from TMDB API (server-side)"""
    if not TMDB_API_KEY:
        return None
    try:
        url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={movie_title}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('results') and len(data['results']) > 0:
                poster_path = data['results'][0].get('poster_path')
                if poster_path:
                    return f"https://image.tmdb.org/t/p/w500{poster_path}"
        return None
    except Exception as e:
        logger.error(f"Error fetching poster for {movie_title}: {e}")
        return None

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