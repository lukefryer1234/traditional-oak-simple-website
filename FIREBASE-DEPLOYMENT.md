# Firebase Deployment Guide for Oak Structures Admin Dashboard

This guide provides step-by-step instructions for deploying the Oak Structures Admin Dashboard to Firebase. The deployment process includes setting up Firebase Authentication, Firestore, and Firebase Storage, as well as configuring security rules and creating an admin user.

## Prerequisites

Before you begin, make sure you have the following:

1. A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
2. Node.js and npm installed on your machine
3. Firebase CLI installed (`npm install -g firebase-tools`)
4. Google Cloud CLI installed (for fixing Google Authentication)

## Setup Environment Variables

1. Copy the `.env.example` file to `.env.local`:
   ```
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key
   ```

3. To get your Firebase service account key:
   - Go to the Firebase Console
   - Navigate to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-admin-key.json` in the project root

## Deployment Scripts

This project includes several scripts to help with the deployment process:

### 1. Update Firestore Rules

The `update-firestore-rules.js` script updates the Firestore security rules to support the admin dashboard functionality:

```bash
node update-firestore-rules.js
```

This script:
- Updates the `firestore.rules` file with rules that support role-based access control
- Deploys the updated rules to Firebase

### 2. Update Storage Rules

The `update-storage-rules.js` script updates the Firebase Storage security rules:

```bash
node update-storage-rules.js
```

This script:
- Updates the `storage.rules` file with rules that support role-based access control
- Deploys the updated rules to Firebase

### 3. Fix Google Authentication

The `update-google-auth.js` script fixes the Google authentication issue by updating the OAuth consent screen with the privacy policy URL:

```bash
node update-google-auth.js
```

This script:
- Gets the Firebase project ID from `.firebaserc`
- Gets the deployed URL of the website
- Updates the OAuth consent screen with the privacy policy URL
- Updates the authorized domains for Firebase Authentication

### 4. Set Up Admin User

The `setup-admin-user.js` script creates or updates a user with the SUPER_ADMIN role:

```bash
node setup-admin-user.js
```

This script:
- Prompts for an email address
- Checks if the user exists in Firebase Authentication
- Creates a new user if not found
- Sets the SUPER_ADMIN role for the user
- Updates the user document in Firestore

### 5. Full Deployment

The `deploy.js` script handles the entire deployment process:

```bash
node deploy.js
```

This script:
- Builds the Next.js application
- Updates Firestore and Storage rules
- Deploys the application to Firebase
- Sets up Google Authentication

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

1. Build the Next.js application:
   ```bash
   npm run build
   ```

2. Update Firestore and Storage rules:
   ```bash
   node update-firestore-rules.js
   node update-storage-rules.js
   ```

3. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

4. Fix Google Authentication:
   ```bash
   node update-google-auth.js
   ```

5. Set up an admin user:
   ```bash
   node setup-admin-user.js
   ```

## Troubleshooting

### Google Authentication Issues

If you encounter issues with Google Authentication:

1. Check that the OAuth consent screen is properly configured:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > OAuth consent screen
   - Make sure the privacy policy URL is set to `https://your-project-id.web.app/privacy`

2. Check that the authorized domains are properly configured:
   - Go to the Firebase Console
   - Navigate to Authentication > Settings
   - Make sure your domain is listed in the Authorized domains section

### Firestore Rules Issues

If you encounter issues with Firestore rules:

1. Check the rules in the Firebase Console:
   - Go to the Firebase Console
   - Navigate to Firestore Database > Rules
   - Make sure the rules match the ones in `firestore.rules`

2. Test the rules using the Firebase Rules Playground:
   - Go to the Firebase Console
   - Navigate to Firestore Database > Rules
   - Click "Rules Playground"
   - Test different scenarios to ensure the rules are working as expected

### Storage Rules Issues

If you encounter issues with Storage rules:

1. Check the rules in the Firebase Console:
   - Go to the Firebase Console
   - Navigate to Storage > Rules
   - Make sure the rules match the ones in `storage.rules`

## Next Steps

After deploying the admin dashboard:

1. Log in with your admin user
2. Use the admin dashboard to manage users, products, orders, and content
3. Set up additional authentication providers if needed
4. Configure any additional settings for your specific requirements

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
