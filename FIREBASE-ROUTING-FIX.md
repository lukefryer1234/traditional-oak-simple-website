# Firebase Routing Fix for Oak Structures Website

This document explains the changes made to fix the 404 error issues on the Oak Structures website deployed to Firebase.

## Problem

The website was experiencing 404 errors when navigating to routes that should be handled by the Next.js application. This is a common issue when deploying Next.js applications to Firebase Hosting, as Firebase needs specific configuration to properly handle client-side routing.

## Solution

Two key changes were made to fix this issue:

### 1. Updated Firebase Configuration

The `firebase.json` file was updated to include a rewrites rule that redirects all requests to the index.html file. This allows the Next.js client-side router to handle the routing instead of Firebase trying to find static files for each route.

```json
{
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-central1"
    },
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

The key addition is the `rewrites` section, which tells Firebase to serve the `index.html` file for any request that doesn't match a static file. This allows the Next.js application to handle the routing client-side.

### 2. Improved 404 Page

The default Firebase 404.html page was replaced with a custom 404 page that matches the style of the Oak Structures website. This provides a better user experience when users do encounter a 404 error.

The new 404 page includes:
- Consistent styling with the rest of the website
- Clear error messaging
- Navigation links to help users find what they're looking for
- The Oak Structures branding and header/footer

## Deployment

A new script `redeploy-hosting.sh` was created to quickly redeploy just the hosting configuration to Firebase. This script can be run with:

```bash
./redeploy-hosting.sh
```

This will deploy only the hosting configuration, which is faster than deploying the entire project.

## Verification

After deploying these changes, you should verify that:

1. Navigation within the application works correctly without 404 errors
2. Deep linking (directly accessing a URL path) works correctly
3. The custom 404 page is displayed for truly non-existent routes

## Additional Information

For Next.js applications deployed to Firebase, it's important to understand how the routing works:

- Firebase Hosting serves static files first if they exist
- The rewrites rule redirects any request that doesn't match a static file to the index.html
- The Next.js client-side router then takes over and renders the appropriate page based on the URL

This approach ensures that both server-side and client-side routing work correctly in a Firebase hosting environment.
