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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed. Please install Node.js and try again."
  exit 1
fi

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
deploy() {
  print_header "Oak Structures Admin Dashboard Deployment"
  print_message "Starting deployment process..."
  
  # Check if .env.local exists
  if [ ! -f .env.local ]; then
    print_warning "Warning: .env.local file not found. Make sure your environment variables are set correctly."
    
    # Check if .env.example exists and prompt to copy it
    if [ -f .env.example ]; then
      print_warning "An .env.example file was found. You should copy it to .env.local and update the values."
      read -p "Would you like to copy .env.example to .env.local now? (y/n): " answer
      if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        cp .env.example .env.local
        print_message ".env.example copied to .env.local. Please edit it with your actual values before continuing."
        read -p "Press Enter when you have updated .env.local to continue, or type 'exit' to abort: " continue_answer
        if [ "$continue_answer" = "exit" ]; then
          exit 0
        fi
      fi
    fi
  fi
  
  # Step 1: Build the Next.js application
  print_header "Building Next.js Application"
  if ! npm run build; then
    print_error "Build failed."
    read -p "Would you like to continue with deployment anyway? (y/n): " answer
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
      exit 1
    fi
  fi
  
  # Step 2: Update Firestore Rules
  print_header "Updating Firestore Rules"
  if ! node update-firestore-rules.js; then
    print_warning "Failed to update Firestore rules. Continuing deployment anyway..."
  fi
  
  # Step 3: Update Storage Rules
  print_header "Updating Storage Rules"
  if ! node update-storage-rules.js; then
    print_warning "Failed to update Storage rules. Continuing deployment anyway..."
  fi
  
  # Step 4: Deploy to Firebase
  print_header "Deploying to Firebase"
  if ! firebase deploy; then
    print_error "Firebase deployment encountered issues. Check the logs above for details."
    read -p "Would you like to continue with Google Authentication setup anyway? (y/n): " answer
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
      exit 1
    fi
  fi
  
  # Step 5: Update Google Authentication
  print_header "Setting Up Google Authentication"
  if ! node update-google-auth.js; then
    print_warning "Google Authentication setup encountered issues. You may need to configure it manually."
  fi
  
  # Step 6: Set up admin user
  print_header "Setting Up Admin User"
  read -p "Would you like to set up an admin user now? (y/n): " answer
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    node setup-admin-user.js
  else
    print_message "Skipping admin user setup. You can run 'node setup-admin-user.js' later to set up an admin user."
  fi
  
  # Deployment complete
  print_header "Deployment Complete"
  print_message "The Oak Structures Admin Dashboard has been successfully deployed!"
  print_message "\nNext steps:"
  echo -e "1. Visit your deployed site and verify everything is working correctly"
  echo -e "2. Set up an initial admin user if you haven't already"
  echo -e "3. Configure any additional authentication providers as needed"
  print_message "\nThank you for using the Oak Structures Admin Dashboard!"
}

# Run the deployment
deploy
