const fs = require('fs');
const { execSync } = require('child_process');

// Updated Storage rules with admin dashboard support
const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Base rule - deny all access by default
    match /{allPaths=**} {
      allow read, write: if false;
    }
    
    // Allow authenticated users to read and write to their own user folder
    match /users/{userId}/{allUserFiles=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to product images
    match /products/{productImage=**} {
      allow read: if true;
      
      // Allow admins to write to products folder
      allow write: if request.auth != null && 
                     (request.auth.token.email == "luke@mcconversions.uk" || 
                      request.auth.token.role == "SUPER_ADMIN" || 
                      request.auth.token.role == "ADMIN" ||
                      request.auth.token.role == "MANAGER");
    }
    
    // Allow public read access to gallery images
    match /gallery/{galleryImage=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     (request.auth.token.email == "luke@mcconversions.uk" || 
                      request.auth.token.role == "SUPER_ADMIN" || 
                      request.auth.token.role == "ADMIN" ||
                      request.auth.token.role == "MANAGER");
    }
    
    // For uploaded order files and attachments
    match /orders/{orderId}/{allOrderFiles=**} {
      // Users can read their own order files, admins can read all
      allow read: if request.auth != null && 
                    (resource.metadata.userId == request.auth.uid || 
                     request.auth.token.role == "SUPER_ADMIN" || 
                     request.auth.token.role == "ADMIN" ||
                     request.auth.token.role == "MANAGER");
      
      // Users can write to their own orders, admins can write to all
      allow write: if request.auth != null && 
                    (request.resource.metadata.userId == request.auth.uid || 
                     request.auth.token.role == "SUPER_ADMIN" || 
                     request.auth.token.role == "ADMIN" ||
                     request.auth.token.role == "MANAGER");
    }
  }
}`;

// Write the updated rules to the storage.rules file
fs.writeFileSync('storage.rules', storageRules);
console.log('Updated Storage rules written to storage.rules');

// Deploy the updated rules to Firebase
try {
  console.log('Deploying updated Storage rules to Firebase...');
  execSync('firebase deploy --only storage', { stdio: 'inherit' });
  console.log('Storage rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Storage rules:', error);
}
