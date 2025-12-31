#!/usr/bin/env python3
"""
Comprehensive deployment verification script.
Tests the live backend and verifies CORS configuration.
"""

import requests
import json
import time

# Configuration
BACKEND_URL = "https://end-to-end-movie-recommendation-system-k25k.onrender.com"
FRONTEND_URL = "https://end-to-end-movie-recommendation-sys.vercel.app"

def print_header(title):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def test_health_check():
    """Test if the backend is alive and check version"""
    print_header("1. Health Check Test")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nResponse:")
            print(json.dumps(data, indent=2))
            
            # Check if we have the updated version
            if data.get('message') == 'Backend is live':
                print("\n✓ UPDATED VERSION DETECTED!")
                print("  The backend has been redeployed with the new changes.")
            else:
                print("\n⚠️  OLD VERSION DETECTED")
                print("  The backend is running the old code.")
                print("  Expected message: 'Backend is live'")
                print(f"  Got: '{data.get('message', data.get('status'))}'")
            
            return True
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False

def test_cors_headers():
    """Test CORS configuration"""
    print_header("2. CORS Configuration Test")
    try:
        # Preflight request
        headers = {
            'Origin': FRONTEND_URL,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{BACKEND_URL}/recommend", headers=headers, timeout=10)
        
        print(f"Preflight Status: {response.status_code}")
        print(f"\nCORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
        
        allowed_origin = response.headers.get('Access-Control-Allow-Origin')
        if allowed_origin == FRONTEND_URL:
            print(f"\n✓ CORS correctly configured for: {FRONTEND_URL}")
            return True
        elif allowed_origin == '*':
            print(f"\n⚠️  CORS allows all origins (wildcard)")
            print("  This works but is less secure than specific origin.")
            return True
        else:
            print(f"\n✗ CORS not properly configured")
            print(f"  Expected: {FRONTEND_URL}")
            print(f"  Got: {allowed_origin}")
            return False
            
    except Exception as e:
        print(f"✗ CORS test error: {e}")
        return False

def test_movie_recommendation(movie_title="The Dark Knight", max_wait=60):
    """Test movie recommendation endpoint with retry logic"""
    print_header("3. Movie Recommendation Test")
    
    print(f"Testing with movie: '{movie_title}'")
    print(f"Max wait time: {max_wait}s (for cold start)")
    
    try:
        print("\nSending request...")
        start_time = time.time()
        
        response = requests.post(
            f"{BACKEND_URL}/recommend",
            json={"movie_title": movie_title},
            headers={
                "Content-Type": "application/json",
                "Origin": FRONTEND_URL
            },
            timeout=max_wait
        )
        
        elapsed = time.time() - start_time
        print(f"Response received in {elapsed:.2f}s")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✓ SUCCESS!")
            print(f"Query: {data.get('query', 'N/A')}")
            print(f"Recommendations count: {data.get('count', 0)}")
            
            movies = data.get('movies', [])
            if movies:
                print(f"\nTop 5 Recommendations:")
                for i, movie in enumerate(movies[:5], 1):
                    poster = data.get('posters', [])[i-1] if i-1 < len(data.get('posters', [])) else None
                    poster_status = "🖼️ " if poster else "📋 "
                    print(f"  {i}. {poster_status}{movie}")
                
                print(f"\n✓ Movie recommendation test PASSED!")
                return True
            else:
                print("\n✗ No recommendations returned")
                return False
                
        elif response.status_code == 502:
            print(f"\n✗ 502 Bad Gateway Error")
            print("  Possible causes:")
            print("  1. Backend is still starting up (cold start)")
            print("  2. Request timeout (processing takes too long)")
            print("  3. Worker crash during processing")
            print("  4. Missing data files (Artifacts folder)")
            print("\n  Suggested fixes:")
            print("  - Increase gunicorn timeout in Dockerfile")
            print("  - Add --preload flag to gunicorn")
            print("  - Initialize similarity matrix at module load")
            return False
            
        elif response.status_code == 404:
            error_data = response.json() if 'application/json' in response.headers.get('content-type', '') else {}
            print(f"\n✗ Movie not found: {error_data.get('error', 'N/A')}")
            return False
        else:
            error_data = response.json() if 'application/json' in response.headers.get('content-type', '') else {}
            print(f"\n✗ Request failed: {error_data.get('error', response.text[:200])}")
            return False
            
    except requests.Timeout:
        print(f"\n✗ Request timed out after {max_wait}s")
        print("  The backend is taking too long to respond.")
        print("  This often happens on first request (cold start).")
        return False
    except Exception as e:
        print(f"\n✗ Recommendation test error: {e}")
        return False

def test_suggestions_endpoint():
    """Test the suggestions API"""
    print_header("4. Suggestions API Test")
    try:
        response = requests.get(f"{BACKEND_URL}/api/suggestions", timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            suggestions = data.get('suggestions', [])
            print(f"Total suggestions: {len(suggestions)}")
            if suggestions:
                print(f"Sample suggestions: {suggestions[:5]}")
                print(f"\n✓ Suggestions API test PASSED!")
                return True
            else:
                print("\n✗ No suggestions returned")
                return False
        else:
            print(f"✗ Request failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Suggestions test error: {e}")
        return False

def main():
    """Run all tests"""
    print_header("COMPREHENSIVE BACKEND VERIFICATION")
    print(f"Backend URL:  {BACKEND_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    
    results = {}
    
    # Test 1: Health Check
    results['health'] = test_health_check()
    time.sleep(1)
    
    # Test 2: CORS Headers
    results['cors'] = test_cors_headers()
    time.sleep(1)
    
    # Test 3: Suggestions
    results['suggestions'] = test_suggestions_endpoint()
    time.sleep(1)
    
    # Test 4: Movie Recommendation (most important)
    results['recommendation'] = test_movie_recommendation()
    
    # Summary
    print_header("TEST SUMMARY")
    print(f"1. Health Check:         {'✓ PASSED' if results['health'] else '✗ FAILED'}")
    print(f"2. CORS Configuration:   {'✓ PASSED' if results['cors'] else '✗ FAILED'}")
    print(f"3. Suggestions API:      {'✓ PASSED' if results['suggestions'] else '✗ FAILED'}")
    print(f"4. Movie Recommendations:{'✓ PASSED' if results['recommendation'] else '✗ FAILED'}")
    print("=" * 70)
    
    passed = sum(results.values())
    total = len(results)
    print(f"\nResult: {passed}/{total} tests passed")
    
    if all(results.values()):
        print("\n🎉 ALL TESTS PASSED! The backend is fully functional.")
        print(f"✓ Frontend ({FRONTEND_URL}) can communicate with")
        print(f"✓ Backend ({BACKEND_URL})")
        print("\nDeployment Status: ✓ READY FOR PRODUCTION")
        return 0
    else:
        print("\n⚠️  SOME TESTS FAILED")
        if not results['recommendation']:
            print("\n📝 NEXT STEPS:")
            print("1. Verify that the updated code has been deployed to Render")
            print("2. Check Render logs for any startup errors")
            print("3. Ensure Artifacts folder is included in deployment")
            print("4. Verify TMDB_API_KEY environment variable is set")
            print("5. Consider increasing gunicorn timeout if cold start is slow")
        return 1

if __name__ == "__main__":
    exit(main())
