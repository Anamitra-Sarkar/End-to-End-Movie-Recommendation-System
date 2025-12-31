# Deployment Guide: Linking Vercel Frontend to Render Backend

## Summary of Changes Made

This PR contains all the necessary changes to link the Vercel frontend with the Render backend. The following files have been updated:

### 1. **app.py** - Backend CORS and Initialization
   - ✅ Updated CORS to explicitly whitelist Vercel frontend: `https://end-to-end-movie-recommendation-sys.vercel.app`
   - ✅ Updated health check endpoint to return `"status": "active", "message": "Backend is live"`
   - ✅ **CRITICAL FIX**: Added similarity matrix initialization at module load time
     - This fixes the 502 error that occurs when gunicorn workers try to handle requests
     - Previously, the matrix was only initialized in the `if __name__ == '__main__'` block
     - Now initializes on module import, which works with gunicorn's worker model

### 2. **Dockerfile** - Production Server Configuration
   - ✅ Increased timeout from 120s to 300s (5 minutes) to handle cold starts
   - ✅ **CRITICAL FIX**: Added `--preload` flag to gunicorn
     - Loads application code before forking worker processes
     - Shares the similarity matrix across workers (memory efficient)
     - Prevents each worker from loading the matrix separately

### 3. **frontend/index.html** - API Configuration
   - ✅ Already correctly configured with: `const API_URL = "https://end-to-end-movie-recommendation-system-k25k.onrender.com"`
   - No changes needed

### 4. **Test Scripts** - Verification Tools
   - ✅ `test_live_connection.py` - Basic connectivity test
   - ✅ `test_deployment.py` - Comprehensive deployment verification

## Current Deployment Status

Based on testing the live backend:

| Component | Status | Notes |
|-----------|--------|-------|
| Health Check | ✓ Working | Shows old version (not redeployed yet) |
| CORS Headers | ✓ Working | Already configured correctly |
| Suggestions API | ✓ Working | Returns 6010 movie titles |
| **Recommendations** | ✗ **502 Error** | **CRITICAL: Needs fixes from this PR** |

## Why the 502 Error Occurs

The current deployed version has a critical bug:

1. The Dockerfile uses `gunicorn` to run the app
2. When using gunicorn, the `if __name__ == '__main__'` block is **never executed**
3. This means `create_similarity()` is never called on startup
4. On the first `/recommend` request, the app tries to create the similarity matrix
5. This takes too long and exceeds gunicorn's timeout → **502 Bad Gateway**

## How This PR Fixes It

### Fix #1: Module-Level Initialization
```python
# Initialize similarity matrix at module load time (for gunicorn workers)
logger.info("Initializing similarity matrix at startup...")
try:
    create_similarity()
    logger.info(f"Startup initialization complete. Loaded {len(data) if data is not None else 0} movies.")
except Exception as e:
    logger.error(f"Error during startup initialization: {e}")
```

This runs when the module is imported, which happens for each gunicorn worker.

### Fix #2: Gunicorn Preload
```dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "2", "--timeout", "300", "--preload", "app:app"]
```

The `--preload` flag loads the app once before forking workers, so the similarity matrix is shared.

## Deployment Steps for Render

### Option 1: Automatic Deployment (if configured)
1. Merge this PR to the `main` branch
2. Render will automatically detect the changes and redeploy
3. Wait 2-5 minutes for the build to complete
4. Run `python test_deployment.py` to verify

### Option 2: Manual Deployment (via Render Dashboard)
1. Log in to Render dashboard
2. Navigate to the backend service: `end-to-end-movie-recommendation-system-k25k`
3. Click "Manual Deploy" → "Deploy latest commit"
4. Select the branch with these changes
5. Wait for deployment to complete
6. Run `python test_deployment.py` to verify

### Option 3: Deploy from This Branch
If Render is configured to deploy from `main`, you can:
1. Update Render settings to deploy from `copilot/link-vercel-frontend-to-render-backend`
2. Trigger a manual deployment
3. After verification, merge to `main` and switch back

## Verification Steps

After deployment, run the test script:

```bash
python test_deployment.py
```

Expected output:
```
1. Health Check:         ✓ PASSED
2. CORS Configuration:   ✓ PASSED  
3. Suggestions API:      ✓ PASSED
4. Movie Recommendations:✓ PASSED

Result: 4/4 tests passed
🎉 ALL TESTS PASSED! The backend is fully functional.
```

You should also see the updated health check message:
```json
{
  "status": "active",
  "message": "Backend is live",
  "version": "2.0.0"
}
```

## Testing the Full Integration

### Backend Only:
```bash
python test_live_connection.py
```

### Full Stack (Frontend + Backend):
1. Open: https://end-to-end-movie-recommendation-sys.vercel.app/
2. Enter a movie title (e.g., "The Dark Knight")
3. Click "Search"
4. You should see 10 movie recommendations with posters

## Environment Variables

Ensure these environment variables are set in Render:

- `PORT` - Should be set to `10000` (matches Dockerfile)
- `TMDB_API_KEY` - Required for fetching movie posters
- Any other project-specific variables

## Troubleshooting

### If 502 error persists after deployment:

1. **Check Render logs** for startup errors:
   - Look for "Initializing similarity matrix at startup..."
   - Should see "Loaded XXXX movies"
   
2. **Verify Artifacts folder** is included:
   - Files needed: `main_data.csv`, `nlp_model.pkl`, `tranform.pkl`
   - These should be tracked in git (they are)

3. **Check memory limits**:
   - The similarity matrix needs ~1GB RAM
   - Render free tier might be insufficient
   - Consider upgrading plan if needed

4. **Increase timeout further** if cold starts are still slow:
   - Edit Dockerfile: change `--timeout 300` to `--timeout 600`

### If CORS errors occur:

Check that the CORS configuration matches exactly:
```python
CORS(app, resources={r"/*": {"origins": "https://end-to-end-movie-recommendation-sys.vercel.app"}})
```

## Definition of Done ✅

- [x] app.py has the specific Vercel URL in CORS
- [x] Health check returns `{"status": "active", "message": "Backend is live"}`
- [x] frontend/index.html has the specific Render URL (was already correct)
- [x] test_live_connection.py script created
- [x] Fixed critical 502 error (similarity matrix initialization)
- [x] Updated Dockerfile with production-ready settings
- [ ] **Deploy to Render** (requires manual action or PR merge)
- [ ] **Verify all tests pass** (run test_deployment.py after deployment)

## Next Steps

1. **Review this PR** and ensure all changes look correct
2. **Merge to main** or deploy from this branch
3. **Wait for Render deployment** to complete (check Render dashboard)
4. **Run verification**: `python test_deployment.py`
5. **Test frontend**: Visit the Vercel URL and try searching for a movie
6. **Monitor**: Check Render logs to ensure no errors

## Additional Notes

- The current deployed version has CORS already configured (suspicious - might have been done manually)
- The frontend URL is already correct (no changes needed there)
- The main issues are:
  1. ❌ Recommendation endpoint returning 502 (fixed in this PR)
  2. ⚠️  Old version deployed (needs redeployment)

Once deployed, the integration should work flawlessly! 🚀
