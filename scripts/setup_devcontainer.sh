#!/usr/bin/env bash
set -euo pipefail

# Install required OS packages for building Python packages on Ubuntu 24.04
if ! command -v apt-get >/dev/null 2>&1; then
  echo "apt-get not found; run these steps manually on the host: install a distutils package, python3-dev, build-essential, gfortran, libatlas-base-dev, libopenblas-dev, liblapack-dev, pkg-config"
  exit 1
fi

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo "Not running as root and sudo not available. Run this script as root or install the packages manually."
    exit 1
  fi
fi

$SUDO apt-get update

# Try installing distutils from several possible package names (Ubuntu 24.04 uses python3.12-distutils)
DISTUTILS_PKGS=("python3-distutils" "python3.12-distutils" "python3.11-distutils")
DISTUTILS_INSTALLED=0
for pkg in "${DISTUTILS_PKGS[@]}"; do
  if $SUDO apt-get install -y "$pkg" 2>/dev/null; then
    DISTUTILS_INSTALLED=1
    break
  fi
done

if [ "$DISTUTILS_INSTALLED" -ne 1 ]; then
  echo "Could not install python3 distutils via apt. Please install an appropriate distutils package (e.g. python3.12-distutils) and re-run."
  exit 1
fi

# Install other build dependencies
$SUDO apt-get install -y python3-dev build-essential gfortran libatlas-base-dev libopenblas-dev liblapack-dev pkg-config

# Ensure venv exists and activate it
if [ ! -d ".venv" ]; then
  python -m venv .venv
fi
# shellcheck source=/dev/null
. .venv/bin/activate

# Upgrade packaging tools and install requirements
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "Setup complete. Activate the venv with: source .venv/bin/activate"
