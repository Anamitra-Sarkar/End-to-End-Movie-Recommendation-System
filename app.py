import json
import pickle
import requests
import bs4 as bs
import numpy as np
import pandas as pd
import urllib.request
import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Get TMDB API key from environment variable
TMDB_API_KEY = os.environ.get('TMDB_API_KEY', '5ce2ef2d7c461dea5b4e04900d1c561e')

# Loading the dataset and the trained model
try:
    clf = pickle.load(open("./Artifacts/nlp_model.pkl", 'rb'))
    vectorizer = pickle.load(open("./Artifacts/tranform.pkl", 'rb'))
    print("Models loaded successfully")
except Exception as e:
    print(f"Error loading models: {e}")
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
        print("Similarity matrix created successfully")
        return data, similarity
    except Exception as e:
        print(f"Error creating similarity: {e}")
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
        print(f"Error in recommendation: {e}")
        return f'Error: {str(e)}'

def convert_to_list(my_list):
    """Convert string representation of list to actual list"""
    my_list = my_list.split('","')
    my_list[0] = my_list[0].replace('["', '')
    my_list[-1] = my_list[-1].replace('"]', '')
    return my_list

def get_suggestions():
    """Get list of all movie titles for autocomplete"""
    global data
    try:
        if data is None:
            data_path = os.path.join(os.path.dirname(__file__), 'Artifacts', 'main_data.csv')
            data = pd.read_csv(data_path)
        return list(data['movie_title'].str.capitalize())
    except Exception as e:
        print(f"Error getting suggestions: {e}")
        return []

@app.route("/")
@app.route("/home")
def home():
    """Home page route"""
    suggestions = get_suggestions()
    return render_template('home.html', suggestions=suggestions)

@app.route("/api/config", methods=["GET"])
def get_config():
    """API endpoint to get configuration (like TMDB API key)"""
    return jsonify({
        'tmdbApiKey': TMDB_API_KEY
    })

@app.route("/similarity", methods=["POST"])
def similarity_route():
    """Get similar movies based on input"""
    try:
        movie = request.form.get('name', '')
        if not movie:
            return jsonify({'error': 'Movie name is required'}), 400
            
        rc = rcmd(movie)
        if isinstance(rc, str):
            return rc
        else:
            m_str = "---".join(rc)
            return m_str
    except Exception as e:
        print(f"Error in similarity route: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/recommend", methods=["POST"])
def recommend():
    """Get detailed recommendations with cast, reviews, etc."""
    try:
        # getting data from AJAX request
        title = request.form.get('title', '')
        cast_ids = request.form.get('cast_ids', '')
        cast_names = request.form.get('cast_names', '')
        cast_chars = request.form.get('cast_chars', '')
        cast_bdays = request.form.get('cast_bdays', '')
        cast_bios = request.form.get('cast_bios', '')
        cast_places = request.form.get('cast_places', '')
        cast_profiles = request.form.get('cast_profiles', '')
        imdb_id = request.form.get('imdb_id', '')
        poster = request.form.get('poster', '')
        genres = request.form.get('genres', '')
        overview = request.form.get('overview', '')
        vote_average = request.form.get('rating', '')
        vote_count = request.form.get('vote_count', '')
        release_date = request.form.get('release_date', '')
        runtime = request.form.get('runtime', '')
        status = request.form.get('status', '')
        rec_movies = request.form.get('rec_movies', '')
        rec_posters = request.form.get('rec_posters', '')

        # get movie suggestions for auto complete
        suggestions = get_suggestions()

        # call the convert_to_list function for every string that needs to be converted to list
        rec_movies = convert_to_list(rec_movies)
        rec_posters = convert_to_list(rec_posters)
        cast_names = convert_to_list(cast_names)
        cast_chars = convert_to_list(cast_chars)
        cast_profiles = convert_to_list(cast_profiles)
        cast_bdays = convert_to_list(cast_bdays)
        cast_bios = convert_to_list(cast_bios)
        cast_places = convert_to_list(cast_places)
        
        # convert string to list (eg. "[1,2,3]" to [1,2,3])
        cast_ids = cast_ids.split(',')
        cast_ids[0] = cast_ids[0].replace("[", "")
        cast_ids[-1] = cast_ids[-1].replace("]", "")
        
        # rendering the string to python string
        for i in range(len(cast_bios)):
            cast_bios[i] = cast_bios[i].replace(r'\n', '\n').replace(r'\"', '\"')
        
        # combining multiple lists as a dictionary
        movie_cards = {rec_posters[i]: rec_movies[i] for i in range(len(rec_posters))}
        casts = {cast_names[i]: [cast_ids[i], cast_chars[i], cast_profiles[i]] for i in range(len(cast_profiles))}
        cast_details = {cast_names[i]: [cast_ids[i], cast_profiles[i], cast_bdays[i], cast_places[i], cast_bios[i]] for i in range(len(cast_places))}

        # web scraping to get user reviews from IMDB site
        reviews_list = []
        reviews_status = []
        
        if clf and vectorizer and imdb_id:
            try:
                sauce = urllib.request.urlopen(
                    f'https://www.imdb.com/title/{imdb_id}/reviews?ref_=tt_ov_rt',
                    timeout=10
                ).read()
                soup = bs.BeautifulSoup(sauce, 'lxml')
                soup_result = soup.find_all("div", {"class": "text show-more__control"})

                for reviews in soup_result:
                    if reviews.string:
                        reviews_list.append(reviews.string)
                        # passing the review to our model
                        movie_review_list = np.array([reviews.string])
                        movie_vector = vectorizer.transform(movie_review_list)
                        pred = clf.predict(movie_vector)
                        reviews_status.append('Good' if pred else 'Bad')
            except Exception as e:
                print(f"Error scraping reviews: {e}")

        # combining reviews and comments into a dictionary
        movie_reviews = {reviews_list[i]: reviews_status[i] for i in range(len(reviews_list))} if reviews_list else {}

        # passing all the data to the html file
        return render_template(
            'recommend.html',
            title=title,
            poster=poster,
            overview=overview,
            vote_average=vote_average,
            vote_count=vote_count,
            release_date=release_date,
            runtime=runtime,
            status=status,
            genres=genres,
            movie_cards=movie_cards,
            reviews=movie_reviews,
            casts=casts,
            cast_details=cast_details
        )
    except Exception as e:
        print(f"Error in recommend route: {e}")
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    # Initialize similarity matrix on startup
    create_similarity()
    
    # Get port from environment variable for deployment
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host="0.0.0.0", port=port)