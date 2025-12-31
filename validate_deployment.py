#!/usr/bin/env python3
"""
Post-deployment validation script.
Run this AFTER deploying the changes to Render to ensure everything works.
"""

import requests
import json
import time
import sys

# URLs
BACKEND_URL = "https://end-to-end-movie-recommendation-system-k25k.onrender.com"
FRONTEND_URL = "https://end-to-end-movie-recommendation-sys.vercel.app"

def colored_print(message, color=""):
    """Print colored output for better readability"""
    colors = {
        "green": "\033[92m",
        "yellow": "\033[93m",
        "red": "\033[91m",
        "blue": "\033[94m",
        "end": "\033[0m"
    }
    if color in colors:
        print(f"{colors[color]}{message}{colors['end']}")
    else:
        print(message)

def check_deployment_version():
    """Check if the deployed version has our changes"""
    colored_print("\n" + "="*70, "blue")
    colored_print("STEP 1: Checking Deployed Version", "blue")
    colored_print("="*70, "blue")
    
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Check for updated health check message
            if data.get('message') == 'Backend is live':
                colored_print("\n✅ CORRECT VERSION DEPLOYED!", "green")
                colored_print("   The backend has the updated code from this PR.", "green")
                return True
            else:
                colored_print("\n❌ OLD VERSION STILL DEPLOYED", "red")
                colored_print("   The backend is running outdated code.", "red")
                colored_print(f"   Current message: '{data.get('message', data.get('status'))}'", "yellow")
                colored_print(f"   Expected: 'Backend is live'", "yellow")
                colored_print("\n📝 ACTION REQUIRED:", "yellow")
                colored_print("   1. Go to Render dashboard", "yellow")
                colored_print("   2. Find service: end-to-end-movie-recommendation-system-k25k", "yellow")
                colored_print("   3. Click 'Manual Deploy' > 'Deploy latest commit'", "yellow")
                colored_print("   4. Wait 3-5 minutes for deployment to complete", "yellow")
                colored_print("   5. Run this script again", "yellow")
                return False
        else:
            colored_print(f"\n❌ Health check failed: {response.status_code}", "red")
            return False
    except Exception as e:
        colored_print(f"\n❌ Error checking deployment: {e}", "red")
        return False

def test_recommendation_with_retry():
    """Test the recommendation endpoint with retry for cold start"""
    colored_print("\n" + "="*70, "blue")
    colored_print("STEP 2: Testing Recommendation Endpoint", "blue")
    colored_print("="*70, "blue")
    
    test_movie = "The Dark Knight"
    max_attempts = 3
    
    for attempt in range(1, max_attempts + 1):
        colored_print(f"\nAttempt {attempt}/{max_attempts}: Testing with '{test_movie}'...", "blue")
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{BACKEND_URL}/recommend",
                json={"movie_title": test_movie},
                headers={"Content-Type": "application/json"},
                timeout=90
            )
            elapsed = time.time() - start_time
            
            colored_print(f"Response time: {elapsed:.2f}s", "blue")
            colored_print(f"Status code: {response.status_code}", "blue")
            
            if response.status_code == 200:
                data = response.json()
                movies = data.get('movies', [])
                
                colored_print(f"\n✅ RECOMMENDATION ENDPOINT WORKING!", "green")
                colored_print(f"   Query: {data.get('query')}", "green")
                colored_print(f"   Recommendations: {len(movies)}", "green")
                colored_print(f"\n   Top 3 recommendations:", "green")
                for i, movie in enumerate(movies[:3], 1):
                    colored_print(f"      {i}. {movie}", "green")
                
                return True
                
            elif response.status_code == 502:
                colored_print(f"   ⚠️  502 Bad Gateway (Attempt {attempt})", "yellow")
                if attempt < max_attempts:
                    colored_print("   Retrying in 10 seconds (might be cold start)...", "yellow")
                    time.sleep(10)
                else:
                    colored_print("\n❌ RECOMMENDATION ENDPOINT FAILING", "red")
                    colored_print("\n   This 502 error suggests:", "yellow")
                    colored_print("   1. The updated code is NOT deployed yet, OR", "yellow")
                    colored_print("   2. There's a deployment error", "yellow")
                    colored_print("\n   The fixes in this PR should prevent 502 errors:", "yellow")
                    colored_print("   - Module-level similarity matrix initialization", "yellow")
                    colored_print("   - Gunicorn --preload flag", "yellow")
                    colored_print("   - Increased timeout to 300s", "yellow")
                    return False
            else:
                colored_print(f"   Unexpected status: {response.status_code}", "red")
                colored_print(f"   Response: {response.text[:200]}", "red")
                return False
                
        except requests.Timeout:
            colored_print(f"   ⚠️  Request timed out (Attempt {attempt})", "yellow")
            if attempt < max_attempts:
                time.sleep(10)
            else:
                colored_print("\n❌ Consistent timeouts - deployment issue", "red")
                return False
        except Exception as e:
            colored_print(f"   ❌ Error: {e}", "red")
            return False
    
    return False

def test_frontend_backend_integration():
    """Test CORS and frontend-backend communication"""
    colored_print("\n" + "="*70, "blue")
    colored_print("STEP 3: Testing Frontend-Backend Integration", "blue")
    colored_print("="*70, "blue")
    
    try:
        # Simulate a request from the frontend
        response = requests.post(
            f"{BACKEND_URL}/recommend",
            json={"movie_title": "Inception"},
            headers={
                "Content-Type": "application/json",
                "Origin": FRONTEND_URL
            },
            timeout=30
        )
        
        # Check CORS headers
        cors_header = response.headers.get('Access-Control-Allow-Origin')
        
        if cors_header == FRONTEND_URL or cors_header == '*':
            colored_print(f"\n✅ CORS PROPERLY CONFIGURED", "green")
            colored_print(f"   Allow-Origin: {cors_header}", "green")
            
            if response.status_code == 200:
                colored_print(f"   Response: 200 OK", "green")
                colored_print("\n✅ Frontend can successfully call backend!", "green")
                return True
            else:
                colored_print(f"   Response: {response.status_code}", "yellow")
                return False
        else:
            colored_print(f"\n⚠️  CORS might need adjustment", "yellow")
            colored_print(f"   Current: {cors_header}", "yellow")
            colored_print(f"   Expected: {FRONTEND_URL}", "yellow")
            return False
            
    except Exception as e:
        colored_print(f"\n❌ Integration test failed: {e}", "red")
        return False

def print_final_report(version_ok, recommendation_ok, integration_ok):
    """Print final status report"""
    colored_print("\n" + "="*70, "blue")
    colored_print("FINAL DEPLOYMENT STATUS", "blue")
    colored_print("="*70, "blue")
    
    status_color = "green" if version_ok else "red"
    colored_print(f"\n1. Deployment Version: {'✅ UPDATED' if version_ok else '❌ OLD VERSION'}", status_color)
    
    status_color = "green" if recommendation_ok else "red"
    colored_print(f"2. Recommendations:    {'✅ WORKING' if recommendation_ok else '❌ FAILING'}", status_color)
    
    status_color = "green" if integration_ok else "red"
    colored_print(f"3. Integration:        {'✅ WORKING' if integration_ok else '❌ FAILING'}", status_color)
    
    if version_ok and recommendation_ok and integration_ok:
        colored_print("\n" + "🎉"*20, "green")
        colored_print("DEPLOYMENT SUCCESSFUL!", "green")
        colored_print("🎉"*20, "green")
        colored_print("\n✅ All systems operational!", "green")
        colored_print(f"✅ Frontend: {FRONTEND_URL}", "green")
        colored_print(f"✅ Backend:  {BACKEND_URL}", "green")
        colored_print("\n✨ The movie recommendation system is fully functional!", "green")
        return 0
    elif not version_ok:
        colored_print("\n" + "⚠️"*20, "yellow")
        colored_print("DEPLOYMENT REQUIRED", "yellow")
        colored_print("⚠️"*20, "yellow")
        colored_print("\nThe code changes are ready but not deployed yet.", "yellow")
        colored_print("\nNEXT STEPS:", "yellow")
        colored_print("1. Deploy the code to Render:", "yellow")
        colored_print("   - Option A: Merge this PR to main (if auto-deploy is enabled)", "yellow")
        colored_print("   - Option B: Manual deploy via Render dashboard", "yellow")
        colored_print("2. Wait 3-5 minutes for deployment to complete", "yellow")
        colored_print("3. Run this script again to verify", "yellow")
        return 1
    else:
        colored_print("\n" + "❌"*20, "red")
        colored_print("DEPLOYMENT ISSUES DETECTED", "red")
        colored_print("❌"*20, "red")
        colored_print("\nThe deployment may have issues. Check:", "yellow")
        colored_print("1. Render logs for errors", "yellow")
        colored_print("2. Environment variables (especially TMDB_API_KEY)", "yellow")
        colored_print("3. Artifacts folder is included in deployment", "yellow")
        colored_print("4. Memory/resource limits on Render", "yellow")
        return 1

def main():
    """Main validation flow"""
    colored_print("="*70, "blue")
    colored_print("POST-DEPLOYMENT VALIDATION", "blue")
    colored_print("="*70, "blue")
    colored_print(f"\nBackend:  {BACKEND_URL}", "blue")
    colored_print(f"Frontend: {FRONTEND_URL}", "blue")
    
    # Run all checks
    version_ok = check_deployment_version()
    time.sleep(2)
    
    recommendation_ok = False
    integration_ok = False
    
    if version_ok:
        recommendation_ok = test_recommendation_with_retry()
        time.sleep(2)
        integration_ok = test_frontend_backend_integration()
    else:
        colored_print("\n⏭️  Skipping further tests until deployment is updated.", "yellow")
    
    # Final report
    return print_final_report(version_ok, recommendation_ok, integration_ok)

if __name__ == "__main__":
    try:
        exit(main())
    except KeyboardInterrupt:
        colored_print("\n\n⚠️  Validation interrupted by user", "yellow")
        exit(130)
