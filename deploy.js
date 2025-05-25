const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
  }
};

// Helper function to print colored messages
function printMessage(message, color = colors.fg.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to print section headers
function printHeader(message) {
  console.log('\n');
  console.log(`${colors.fg.cyan}${colors.bright}=== ${message} ===${colors.reset}`);
  console.log(`${colors.fg.cyan}${'-'.repeat(message.length + 8)}${colors.reset}`);
}

// Helper function to execute commands and handle errors
function executeCommand(command, errorMessage) {
  try {
    printMessage(`Executing: ${command}`, colors.fg.yellow);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    printMessage(`${errorMessage}: ${error.message}`, colors.fg.red);
    return false;
  }
}

// Main deployment function
async function deploy() {
  printHeader('Oak Structures Admin Dashboard Deployment');
  printMessage('Starting deployment process...', colors.fg.green);
  
  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    printMessage('Warning: .env.local file not found. Make sure your environment variables are set correctly.', colors.fg.yellow);
    
    // Check if .env.example exists and prompt to copy it
    if (fs.existsSync('.env.example')) {
      printMessage('An .env.example file was found. You should copy it to .env.local and update the values.', colors.fg.yellow);
      const answer = await askQuestion('Would you like to copy .env.example to .env.local now? (y/n): ');
      if (answer.toLowerCase() === 'y') {
        fs.copyFileSync('.env.example', '.env.local');
        printMessage('.env.example copied to .env.local. Please edit it with your actual values before continuing.', colors.fg.green);
        const continueAnswer = await askQuestion('Press Enter when you have updated .env.local to continue, or type "exit" to abort: ');
        if (continueAnswer.toLowerCase() === 'exit') {
          process.exit(0);
        }
      }
    }
  }
  
  // Step 1: Build the Next.js application
  printHeader('Building Next.js Application');
  if (!executeCommand('npm run build', 'Build failed')) {
    const answer = await askQuestion('Build failed. Would you like to continue with deployment anyway? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }
  
  // Step 2: Update Firestore Rules
  printHeader('Updating Firestore Rules');
  if (!executeCommand('node update-firestore-rules.js', 'Failed to update Firestore rules')) {
    printMessage('Continuing deployment despite Firestore rules update failure...', colors.fg.yellow);
  }
  
  // Step 3: Update Storage Rules
  printHeader('Updating Storage Rules');
  if (!executeCommand('node update-storage-rules.js', 'Failed to update Storage rules')) {
    printMessage('Continuing deployment despite Storage rules update failure...', colors.fg.yellow);
  }
  
  // Step 4: Deploy to Firebase
  printHeader('Deploying to Firebase');
  if (!executeCommand('firebase deploy', 'Firebase deployment failed')) {
    printMessage('Firebase deployment encountered issues. Check the logs above for details.', colors.fg.red);
    const answer = await askQuestion('Would you like to continue with Google Authentication setup anyway? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }
  
  // Step 5: Update Google Authentication
  printHeader('Setting Up Google Authentication');
  if (!executeCommand('node update-google-auth.js', 'Failed to update Google Authentication')) {
    printMessage('Google Authentication setup encountered issues. You may need to configure it manually.', colors.fg.yellow);
  }
  
  // Deployment complete
  printHeader('Deployment Complete');
  printMessage('The Oak Structures Admin Dashboard has been successfully deployed!', colors.fg.green);
  printMessage('\nNext steps:', colors.fg.cyan);
  printMessage('1. Visit your deployed site and verify everything is working correctly', colors.fg.white);
  printMessage('2. Set up an initial admin user if you haven\'t already', colors.fg.white);
  printMessage('3. Configure any additional authentication providers as needed', colors.fg.white);
  printMessage('\nThank you for using the Oak Structures Admin Dashboard!', colors.fg.green);
}

// Helper function to ask questions in the terminal
function askQuestion(question) {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

// Run the deployment
deploy().catch(error => {
  printMessage(`Deployment failed: ${error.message}`, colors.fg.red);
  process.exit(1);
});
