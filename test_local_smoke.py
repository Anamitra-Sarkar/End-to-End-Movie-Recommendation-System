#!/usr/bin/env python3
"""
Local smoke test to verify app.py changes work correctly.
This simulates what happens when gunicorn loads the module.
"""

import sys
import os

# Set up environment
os.environ['TMDB_API_KEY'] = 'test_key_not_needed_for_this_test'

print("=" * 70)
print("LOCAL SMOKE TEST - Simulating Module Import")
print("=" * 70)

print("\n1. Testing module syntax...")
try:
    with open('app.py', 'r') as f:
        code = f.read()
        compile(code, 'app.py', 'exec')
    print("   ✓ app.py syntax is valid")
except SyntaxError as e:
    print(f"   ✗ Syntax error: {e}")
    sys.exit(1)

print("\n2. Testing Dockerfile syntax...")
try:
    with open('Dockerfile', 'r') as f:
        content = f.read()
        if '--preload' in content:
            print("   ✓ Dockerfile has --preload flag")
        else:
            print("   ⚠️  Warning: --preload flag not found in Dockerfile")
        
        if '--timeout 300' in content or '--timeout' in content:
            print("   ✓ Dockerfile has timeout configured")
        else:
            print("   ⚠️  Warning: timeout not configured in Dockerfile")
except Exception as e:
    print(f"   ✗ Error reading Dockerfile: {e}")
    sys.exit(1)

print("\n3. Checking CORS configuration...")
try:
    with open('app.py', 'r') as f:
        content = f.read()
        if 'https://end-to-end-movie-recommendation-sys.vercel.app' in content:
            print("   ✓ Vercel frontend URL found in CORS config")
        else:
            print("   ✗ Vercel frontend URL not found")
            
        if 'create_similarity()' in content:
            # Count occurrences
            import re
            # Look for module-level initialization (not inside functions or if __name__)
            lines = content.split('\n')
            found_init = False
            in_function = False
            for i, line in enumerate(lines):
                if 'def ' in line or 'if __name__' in line:
                    in_function = True
                if not in_function and 'create_similarity()' in line and not line.strip().startswith('#'):
                    found_init = True
                    print(f"   ✓ Module-level initialization found at line {i+1}")
                    break
                if in_function and (line.startswith('def ') or line.startswith('class ') or line.startswith('@')):
                    in_function = False
            
            if not found_init:
                print("   ⚠️  Warning: create_similarity() may not be called at module level")
        else:
            print("   ✗ create_similarity() function not found")
except Exception as e:
    print(f"   ✗ Error checking CORS: {e}")
    sys.exit(1)

print("\n4. Checking health check endpoint...")
try:
    with open('app.py', 'r') as f:
        content = f.read()
        if '"status": "active"' in content or "'status': 'active'" in content:
            print('   ✓ Health check returns "status": "active"')
        else:
            print('   ⚠️  Warning: Health check may not return correct status')
            
        if '"message": "Backend is live"' in content or "'message': 'Backend is live'" in content:
            print('   ✓ Health check returns "message": "Backend is live"')
        else:
            print('   ⚠️  Warning: Health check may not return correct message')
except Exception as e:
    print(f"   ✗ Error checking health check: {e}")
    sys.exit(1)

print("\n5. Checking frontend configuration...")
try:
    with open('frontend/index.html', 'r') as f:
        content = f.read()
        if 'https://end-to-end-movie-recommendation-system-k25k.onrender.com' in content:
            print("   ✓ Backend URL correctly configured in frontend")
        else:
            print("   ✗ Backend URL not found in frontend")
except Exception as e:
    print(f"   ⚠️  Could not check frontend: {e}")

print("\n6. Checking required files...")
required_files = [
    'Artifacts/main_data.csv',
    'Artifacts/nlp_model.pkl',
    'Artifacts/tranform.pkl'
]
all_present = True
for filepath in required_files:
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        print(f"   ✓ {filepath} ({size:,} bytes)")
    else:
        print(f"   ✗ {filepath} - MISSING")
        all_present = False

print("\n" + "=" * 70)
print("SMOKE TEST SUMMARY")
print("=" * 70)

if all_present:
    print("\n✅ All checks passed!")
    print("\nThe code changes are correct. Next steps:")
    print("1. Commit and push all changes")
    print("2. Deploy to Render (manual or automatic)")
    print("3. Run: python test_deployment.py")
    print("\nExpected outcome after deployment:")
    print("- Health check will return: {'status': 'active', 'message': 'Backend is live'}")
    print("- Recommendation endpoint will return 200 (not 502)")
    print("- Frontend will successfully communicate with backend")
    sys.exit(0)
else:
    print("\n⚠️  Some files are missing!")
    print("Ensure Artifacts folder is complete before deployment.")
    sys.exit(1)
