const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const readline = require('readline');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  fg: {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
  }
};

// Helper function to print colored messages
function printMessage(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Main function
async function setupAdminUser() {
  printMessage('\n=== Oak Structures Admin User Setup ===', colors.fg.cyan + colors.bright);
  printMessage('This script will create or update a user with SUPER_ADMIN role.\n');
  
  // Initialize Firebase Admin SDK
  try {
    // Check if Firebase Admin SDK is already initialized
    if (getApps().length === 0) {
      // Try to load service account from environment variable or file
      let serviceAccount;
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          printMessage('Using service account from environment variable.', colors.fg.green);
        } catch (error) {
          printMessage('Error parsing service account from environment variable.', colors.fg.yellow);
        }
      }
      
      if (!serviceAccount && fs.existsSync('./firebase-admin-key.json')) {
        try {
          serviceAccount = require('./firebase-admin-key.json');
          printMessage('Using service account from firebase-admin-key.json file.', colors.fg.green);
        } catch (error) {
          printMessage('Error loading service account from firebase-admin-key.json file.', colors.fg.yellow);
        }
      }
      
      // Get project ID from .firebaserc if available
      let projectId;
      if (fs.existsSync('./.firebaserc')) {
        try {
          const firebaserc = JSON.parse(fs.readFileSync('./.firebaserc', 'utf8'));
          projectId = firebaserc.projects.default;
          printMessage(`Found project ID from .firebaserc: ${projectId}`, colors.fg.green);
        } catch (error) {
          printMessage('Error reading project ID from .firebaserc file.', colors.fg.yellow);
        }
      }
      
      // Initialize the app
      if (serviceAccount) {
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || projectId
        });
      } else if (projectId) {
        initializeApp({
          projectId
        });
        printMessage('Initialized Firebase Admin SDK with project ID only. Make sure you have the proper credentials set up.', colors.fg.yellow);
      } else {
        initializeApp();
        printMessage('Initialized Firebase Admin SDK with default credentials. Make sure you have the proper credentials set up.', colors.fg.yellow);
      }
    }
    
    const auth = getAuth();
    const db = getFirestore();
    
    // Get user email
    const email = await question('Enter the email address for the admin user: ');
    if (!email || !email.includes('@')) {
      printMessage('Invalid email address. Please provide a valid email.', colors.fg.red);
      rl.close();
      return;
    }
    
    // Check if user exists
    let user;
    try {
      user = await auth.getUserByEmail(email);
      printMessage(`User found: ${user.uid}`, colors.fg.green);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user if not found
        const password = await question('User not found. Enter a password to create a new user: ');
        if (!password || password.length < 6) {
          printMessage('Password must be at least 6 characters long.', colors.fg.red);
          rl.close();
          return;
        }
        
        const displayName = await question('Enter display name for the user: ');
        
        try {
          user = await auth.createUser({
            email,
            password,
            displayName: displayName || undefined,
            emailVerified: true
          });
          printMessage(`Created new user: ${user.uid}`, colors.fg.green);
        } catch (createError) {
          printMessage(`Error creating user: ${createError.message}`, colors.fg.red);
          rl.close();
          return;
        }
      } else {
        printMessage(`Error getting user: ${error.message}`, colors.fg.red);
        rl.close();
        return;
      }
    }
    
    // Set custom claims for SUPER_ADMIN role
    try {
      await auth.setCustomUserClaims(user.uid, { role: 'SUPER_ADMIN' });
      printMessage('Set SUPER_ADMIN role for user.', colors.fg.green);
    } catch (error) {
      printMessage(`Error setting custom claims: ${error.message}`, colors.fg.red);
      rl.close();
      return;
    }
    
    // Update or create user document in Firestore
    try {
      const userRef = db.collection('users').doc(user.uid);
      
      // Get user data from Auth
      const userRecord = await auth.getUser(user.uid);
      
      await userRef.set({
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || '',
        role: 'SUPER_ADMIN',
        status: 'active',
        lastLogin: new Date(),
        createdAt: userRecord.metadata.creationTime ? new Date(userRecord.metadata.creationTime) : new Date(),
        updatedAt: new Date()
      }, { merge: true });
      
      printMessage('Updated user document in Firestore.', colors.fg.green);
    } catch (error) {
      printMessage(`Error updating Firestore: ${error.message}`, colors.fg.red);
      // Continue anyway since the custom claims are set
    }
    
    printMessage('\nAdmin user setup complete!', colors.fg.green + colors.bright);
    printMessage(`User ${email} now has SUPER_ADMIN role and can access all admin features.`, colors.fg.green);
    printMessage('\nNext steps:', colors.fg.cyan);
    printMessage('1. Log in to the admin dashboard with this user');
    printMessage('2. Use the admin dashboard to manage other users and roles');
    printMessage('3. Deploy your application if you haven\'t already');
    
  } catch (error) {
    printMessage(`Unexpected error: ${error.message}`, colors.fg.red);
  } finally {
    rl.close();
  }
}

// Run the setup
setupAdminUser();
