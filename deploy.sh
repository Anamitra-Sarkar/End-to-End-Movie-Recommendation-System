#!/bin/bash
# Quick Start Guide for Vercel-Render Integration

echo "================================================================="
echo "  🎬 Movie Recommendation System - Deployment Helper"
echo "================================================================="
echo ""
echo "This script helps you deploy and validate the integration between"
echo "the Vercel frontend and Render backend."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Error: Python is not installed${NC}"
    echo "Please install Python 3.7+ to run the validation scripts."
    exit 1
fi

PYTHON_CMD=$(command -v python3 || command -v python)

echo "1️⃣  Pre-Deployment Validation"
echo "   Checking if code changes are correct..."
echo ""

if [ -f "test_local_smoke.py" ]; then
    $PYTHON_CMD test_local_smoke.py
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Pre-deployment checks PASSED!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Pre-deployment checks FAILED!${NC}"
        echo "Please fix the issues above before deploying."
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  test_local_smoke.py not found${NC}"
fi

echo ""
echo "================================================================="
echo "2️⃣  Deployment Step"
echo "================================================================="
echo ""
echo "The code is ready to be deployed. You have two options:"
echo ""
echo -e "${BLUE}Option A: Automatic Deployment${NC}"
echo "  1. Merge this PR to the main branch"
echo "  2. Render will auto-deploy (if configured)"
echo "  3. Wait 3-5 minutes"
echo ""
echo -e "${BLUE}Option B: Manual Deployment${NC}"
echo "  1. Go to Render Dashboard: https://dashboard.render.com"
echo "  2. Find service: end-to-end-movie-recommendation-system-k25k"
echo "  3. Click 'Manual Deploy' → 'Deploy latest commit'"
echo "  4. Wait 3-5 minutes"
echo ""

read -p "Press ENTER after you've deployed to Render, or Ctrl+C to exit..."

echo ""
echo "================================================================="
echo "3️⃣  Post-Deployment Validation"
echo "================================================================="
echo ""
echo "Running validation tests..."
echo ""

if [ -f "validate_deployment.py" ]; then
    $PYTHON_CMD validate_deployment.py
    VALIDATION_RESULT=$?
    
    if [ $VALIDATION_RESULT -eq 0 ]; then
        echo ""
        echo "================================================================="
        echo -e "${GREEN}🎉 SUCCESS! Deployment is complete and working!${NC}"
        echo "================================================================="
        echo ""
        echo "You can now test the full application:"
        echo "  Frontend: https://end-to-end-movie-recommendation-sys.vercel.app"
        echo "  Backend:  https://end-to-end-movie-recommendation-system-k25k.onrender.com"
        echo ""
        echo "Try searching for a movie like 'The Dark Knight' to see recommendations!"
        echo ""
    else
        echo ""
        echo "================================================================="
        echo -e "${YELLOW}⚠️  Deployment validation found issues${NC}"
        echo "================================================================="
        echo ""
        echo "Please follow the troubleshooting steps shown above."
        echo "For more details, see DEPLOYMENT_GUIDE.md"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  validate_deployment.py not found${NC}"
    echo "Please run manually: python validate_deployment.py"
fi

echo ""
echo "================================================================="
echo "Additional Resources:"
echo "================================================================="
echo "  📖 DEPLOYMENT_GUIDE.md   - Detailed deployment instructions"
echo "  📖 FINAL_SUMMARY.md      - Complete project summary"
echo "  📖 SECURITY_SUMMARY.md   - Security analysis results"
echo ""
echo "For issues or questions, refer to the documentation above."
echo "================================================================="
