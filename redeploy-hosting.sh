#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header function
print_header() {
  echo -e "\n${CYAN}=== $1 ===${NC}"
  echo -e "${CYAN}$(printf '=%.0s' $(seq 1 $((${#1} + 8))))${NC}"
}

# Print message function
print_message() {
  echo -e "${GREEN}$1${NC}"
}

# Print warning function
print_warning() {
  echo -e "${YELLOW}$1${NC}"
}

# Print error function
print_error() {
  echo -e "${RED}$1${NC}"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  print_error "Firebase CLI is not installed. Please install it with 'npm install -g firebase-tools' and try again."
  exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
  print_error "You are not logged in to Firebase. Please run 'firebase login' and try again."
  exit 1
fi

# Main deployment function
deploy_hosting() {
  print_header "Oak Structures Hosting Redeployment"
  print_message "Starting hosting redeployment process..."
  
  # Deploy only hosting to Firebase
  print_header "Deploying to Firebase Hosting"
  if ! firebase deploy --only hosting; then
    print_error "Firebase hosting deployment encountered issues. Check the logs above for details."
    exit 1
  fi
  
  # Deployment complete
  print_header "Hosting Redeployment Complete"
  print_message "The Oak Structures website hosting has been successfully redeployed!"
  print_message "\nNext steps:"
  echo -e "1. Visit your deployed site and verify the 404 page and routing are working correctly"
  echo -e "2. Test navigation to ensure all routes are working properly"
}

# Run the deployment
deploy_hosting
