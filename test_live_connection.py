#!/usr/bin/env python3
"""
Test script to verify live connection to the Render backend.
This script sends a POST request to the backend and validates the response.
"""

import requests
import json

# Backend URL
BACKEND_URL = "https://end-to-end-movie-recommendation-system-k25k.onrender.com"

def test_health_check():
    """Test if the backend is alive"""
    print("=" * 60)
    print("Testing Backend Health Check...")
    print("=" * 60)
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            print("✓ Health check passed!")
            return True
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False

def test_movie_recommendation():
    """Test movie recommendation endpoint"""
    print("\n" + "=" * 60)
    print("Testing Movie Recommendation Endpoint...")
    print("=" * 60)
    
    test_movie = "The Dark Knight"
    print(f"Requesting recommendations for: {test_movie}")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/recommend",
            json={"movie_title": test_movie},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nQuery: {data.get('query', 'N/A')}")
            print(f"Number of recommendations: {data.get('count', 0)}")
            
            movies = data.get('movies', [])
            if movies:
                print(f"\nFirst recommended movie: {movies[0]}")
                print("\nAll recommendations:")
                for i, movie in enumerate(movies, 1):
                    print(f"  {i}. {movie}")
                print("\n✓ Movie recommendation test passed!")
                return True
            else:
                print("✗ No movie recommendations returned")
                return False
        else:
            error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
            print(f"✗ Request failed: {error_data.get('error', response.text)}")
            return False
            
    except Exception as e:
        print(f"✗ Recommendation test error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("LIVE BACKEND CONNECTION TEST")
    print(f"Backend: {BACKEND_URL}")
    print("=" * 60)
    
    # Test 1: Health Check
    health_ok = test_health_check()
    
    # Test 2: Movie Recommendation
    recommend_ok = test_movie_recommendation()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Health Check: {'✓ PASSED' if health_ok else '✗ FAILED'}")
    print(f"Movie Recommendation: {'✓ PASSED' if recommend_ok else '✗ FAILED'}")
    print("=" * 60)
    
    if health_ok and recommend_ok:
        print("\n🎉 All tests PASSED! Backend is fully functional.")
        return 0
    else:
        print("\n⚠️  Some tests FAILED. Please check the errors above.")
        return 1

if __name__ == "__main__":
    exit(main())
