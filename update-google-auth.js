const { execSync } = require('child_process');
const fs = require('fs');

// Get the Firebase project ID from the .firebaserc file
let projectId;
try {
  const firebaserc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
  projectId = firebaserc.projects.default;
  console.log(`Found Firebase project ID: ${projectId}`);
} catch (error) {
  console.error('Error reading .firebaserc file:', error);
  process.exit(1);
}

// Get the deployed URL of the website
let websiteUrl;
try {
  console.log('Getting Firebase hosting URL...');
  const hostingOutput = execSync('firebase hosting:channel:list', { encoding: 'utf8' });
  const urlMatch = hostingOutput.match(/https:\/\/[a-zA-Z0-9-]+\.web\.app/);
  if (urlMatch) {
    websiteUrl = urlMatch[0];
    console.log(`Found website URL: ${websiteUrl}`);
  } else {
    // Default to project-based URL if we can't find it in the output
    websiteUrl = `https://${projectId}.web.app`;
    console.log(`Using default website URL: ${websiteUrl}`);
  }
} catch (error) {
  // Default to project-based URL if there's an error
  websiteUrl = `https://${projectId}.web.app`;
  console.log(`Using default website URL: ${websiteUrl}`);
}

// Privacy policy URL
const privacyPolicyUrl = `${websiteUrl}/privacy`;
console.log(`Privacy policy URL: ${privacyPolicyUrl}`);

// Check if gcloud CLI is installed
try {
  execSync('gcloud --version', { stdio: 'ignore' });
  console.log('Google Cloud CLI is installed.');
} catch (error) {
  console.error('Google Cloud CLI is not installed. Please install it first.');
  console.error('Visit: https://cloud.google.com/sdk/docs/install');
  process.exit(1);
}

// Check if user is logged in to gcloud
try {
  const accountInfo = execSync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', { encoding: 'utf8' });
  if (!accountInfo.trim()) {
    throw new Error('No active gcloud account found');
  }
  console.log(`Logged in to gcloud as: ${accountInfo.trim()}`);
} catch (error) {
  console.error('Not logged in to gcloud. Please run: gcloud auth login');
  process.exit(1);
}

// Set the project in gcloud
try {
  console.log(`Setting gcloud project to: ${projectId}`);
  execSync(`gcloud config set project ${projectId}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error setting gcloud project:', error);
  process.exit(1);
}

// Update the OAuth consent screen with the privacy policy URL
// console.log('Updating OAuth consent screen with privacy policy URL...');
// try {
//   // First, get the current OAuth consent screen configuration
//   console.log('Getting current OAuth consent screen configuration...');
//   const consentScreenOutput = execSync('gcloud alpha iap oauth-brands list --format=json', { encoding: 'utf8' });
//   const consentScreenConfig = JSON.parse(consentScreenOutput);
  
//   if (consentScreenConfig.length === 0) {
//     console.error('No OAuth consent screen configuration found. Please create one in the Google Cloud Console first.');
//     process.exit(1);
//   }
  
//   // Get the brand name (format: projects/{project_number}/brands/{brand_id})
//   const brandName = consentScreenConfig[0].name;
//   console.log(`Found OAuth brand: ${brandName}`);
  
//   // Update the privacy policy URL
//   console.log(`Updating privacy policy URL to: ${privacyPolicyUrl}`);
//   execSync(`gcloud alpha iap oauth-brands update ${brandName} --privacy_policy_uri=${privacyPolicyUrl}`, { stdio: 'inherit' });
  
//   console.log('OAuth consent screen updated successfully!');
// } catch (error) {
//   console.error('Error updating OAuth consent screen:', error);
//   console.error('You may need to update it manually in the Google Cloud Console:');
//   console.error('1. Go to https://console.cloud.google.com/apis/credentials/consent');
//   console.error(`2. Select project: ${projectId}`);
//   console.error(`3. Update the privacy policy URL to: ${privacyPolicyUrl}`);
// }

// Update the authorized domains for Firebase Authentication
// console.log('Updating authorized domains for Firebase Authentication...');
// try {
//   // Extract the domain from the website URL
//   const domain = websiteUrl.replace('https://', '');
  
//   // Add the domain to Firebase Authentication
//   console.log(`Adding domain to Firebase Authentication: ${domain}`);
//   execSync(`firebase auth:domains:add ${domain}`, { stdio: 'inherit' });
  
//   console.log('Firebase Authentication domains updated successfully!');
// } catch (error) {
//   console.error('Error updating Firebase Authentication domains:', error);
//   console.error('You may need to update them manually in the Firebase Console:');
//   console.error(`1. Go to https://console.firebase.google.com/project/${projectId}/authentication/settings`); // Used template literal
//   console.error('2. In the "Authorized domains" section, add your domain');
// }

console.log('\nGoogle Authentication setup completed!');
console.log('If you encounter any issues, you may need to update the settings manually in the Google Cloud Console and Firebase Console.');
