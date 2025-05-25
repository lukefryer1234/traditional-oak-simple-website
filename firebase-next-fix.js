const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Function to update firebase.json with comprehensive Next.js configuration
function updateFirebaseConfig() {
  printHeader('Updating Firebase Configuration for Next.js');
  
  try {
    // Read the current firebase.json
    const firebaseConfigPath = path.join(process.cwd(), 'firebase.json');
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    
    // Create a backup of the original file
    const backupPath = path.join(process.cwd(), 'firebase.json.bak');
    fs.writeFileSync(backupPath, JSON.stringify(firebaseConfig, null, 2));
    printMessage(`Created backup at ${backupPath}`, colors.fg.green);
    
    // Update the hosting configuration with comprehensive rewrites
    firebaseConfig.hosting = {
      ...firebaseConfig.hosting,
      rewrites: [
        // Handle dynamic routes for products
        {
          "source": "/products/**",
          "destination": "/index.html"
        },
        // Handle admin routes
        {
          "source": "/admin/**",
          "destination": "/index.html"
        },
        // Handle account routes
        {
          "source": "/account/**",
          "destination": "/index.html"
        },
        // Handle API routes with the SSR function
        {
          "source": "/api/**",
          "function": "ssrtimberlinecommerce"
        },
        // Default catch-all route
        {
          "source": "**",
          "destination": "/index.html"
        }
      ],
      // Add headers for better caching and security
      "headers": [
        {
          "source": "**/*.@(js|css)",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "max-age=31536000"
            }
          ]
        },
        {
          "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "max-age=31536000"
            }
          ]
        },
        {
          "source": "404.html",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "max-age=3600"
            }
          ]
        }
      ]
    };
    
    // Write the updated configuration back to firebase.json
    fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
    printMessage('Firebase configuration updated successfully!', colors.fg.green);
    
    return true;
  } catch (error) {
    printMessage(`Error updating Firebase configuration: ${error.message}`, colors.fg.red);
    return false;
  }
}

// Function to create a comprehensive 404 page
function create404Page() {
  printHeader('Creating Enhanced 404 Page');
  
  try {
    const html404Path = path.join(process.cwd(), 'public', '404.html');
    
    // Create a backup of the original file if it exists
    if (fs.existsSync(html404Path)) {
      const backupPath = path.join(process.cwd(), 'public', '404.html.bak');
      fs.copyFileSync(html404Path, backupPath);
      printMessage(`Created backup at ${backupPath}`, colors.fg.green);
    }
    
    // Create an enhanced 404 page with proper styling and navigation
    const html404Content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - Oak Structures</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      background-color: #2c3e50;
      color: white;
      padding: 2rem 0;
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    h2 {
      font-size: 2rem;
      margin: 2rem 0 1rem;
      color: #2c3e50;
    }
    p {
      margin-bottom: 1rem;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
      transition: background-color 0.3s;
      margin-right: 1rem;
      margin-bottom: 1rem;
    }
    .button:hover {
      background-color: #2980b9;
    }
    .footer {
      background-color: #2c3e50;
      color: white;
      padding: 2rem 0;
      text-align: center;
      margin-top: 2rem;
    }
    .error-code {
      font-size: 6rem;
      font-weight: bold;
      color: #e74c3c;
      margin: 0;
      line-height: 1;
    }
    .error-message {
      font-size: 1.5rem;
      margin-top: 0;
      margin-bottom: 2rem;
      color: #7f8c8d;
    }
    /* Add script to redirect to home if this is a client-side route */
    #redirect-message {
      display: none;
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-left: 4px solid #3498db;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Oak Structures</h1>
      <p>Quality Oak Framed Buildings and Products</p>
    </div>
  </header>

  <div class="container">
    <div class="card">
      <p class="error-code">404</p>
      <p class="error-message">Page Not Found</p>
      <p>
        We're sorry, but the page you were looking for couldn't be found. It might have been moved, deleted, or perhaps never existed.
      </p>
      <p>
        Please check the URL for any mistakes or try one of the links below to find what you're looking for:
      </p>
      <div>
        <a href="/" class="button">Home Page</a>
        <a href="/products" class="button">Our Products</a>
        <a href="/contact" class="button">Contact Us</a>
      </div>
      <div id="redirect-message">
        Checking if this is a valid route... If you are not redirected automatically, please click one of the links above.
      </div>
    </div>
  </div>

  <footer class="footer">
    <div class="container">
      <p>&copy; 2025 Oak Structures. All rights reserved.</p>
    </div>
  </footer>

  <script>
    // This script attempts to handle client-side routing
    document.addEventListener('DOMContentLoaded', function() {
      // Check if this might be a client-side route
      const path = window.location.pathname;
      const possibleRoutes = [
        '/products/',
        '/admin/',
        '/account/',
        '/basket',
        '/checkout',
        '/contact',
        '/custom-order',
        '/gallery',
        '/login',
        '/order-confirmation',
        '/preview',
        '/special-deals'
      ];
      
      // Check if the current path starts with any of the possible routes
      const mightBeClientRoute = possibleRoutes.some(route => 
        path.startsWith(route) || path === route.replace('/', '')
      );
      
      if (mightBeClientRoute) {
        // Show redirect message
        document.getElementById('redirect-message').style.display = 'block';
        
        // Try to redirect to the home page and let client-side routing take over
        setTimeout(function() {
          window.location.href = '/?redirect=' + encodeURIComponent(path);
        }, 1500);
      }
    });
  </script>
</body>
</html>`;
    
    // Write the enhanced 404 page
    fs.writeFileSync(html404Path, html404Content);
    printMessage('Enhanced 404 page created successfully!', colors.fg.green);
    
    return true;
  } catch (error) {
    printMessage(`Error creating 404 page: ${error.message}`, colors.fg.red);
    return false;
  }
}

// Function to create a redirect handler for the index.html page
function createRedirectHandler() {
  printHeader('Creating Redirect Handler');
  
  try {
    const indexHtmlPath = path.join(process.cwd(), 'public', 'index.html');
    
    // Read the current index.html
    let indexHtmlContent = '';
    if (fs.existsSync(indexHtmlPath)) {
      indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      
      // Create a backup of the original file
      const backupPath = path.join(process.cwd(), 'public', 'index.html.bak');
      fs.writeFileSync(backupPath, indexHtmlContent);
      printMessage(`Created backup at ${backupPath}`, colors.fg.green);
    } else {
      printMessage('index.html not found, creating a new one', colors.fg.yellow);
    }
    
    // Check if the redirect script already exists
    if (indexHtmlContent.includes('handleRedirectFromUrl')) {
      printMessage('Redirect handler already exists in index.html', colors.fg.yellow);
      return true;
    }
    
    // Find the closing </body> tag
    const bodyCloseIndex = indexHtmlContent.lastIndexOf('</body>');
    
    if (bodyCloseIndex === -1) {
      printMessage('Could not find </body> tag in index.html', colors.fg.red);
      return false;
    }
    
    // Insert the redirect handler script before the closing body tag
    const redirectScript = `
  <!-- Redirect handler for client-side routing -->
  <script>
    function handleRedirectFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      if (redirectPath) {
        // Remove the 'redirect' parameter from the URL
        urlParams.delete('redirect');
        const newUrl = redirectPath + (urlParams.toString() ? '?' + urlParams.toString() : '');
        
        // Use history API to update the URL without reloading the page
        window.history.replaceState({}, document.title, newUrl);
        
        console.log('Redirected from 404 page to:', redirectPath);
      }
    }
    
    // Run the redirect handler when the page loads
    document.addEventListener('DOMContentLoaded', handleRedirectFromUrl);
  </script>
`;
    
    // Insert the script before the closing body tag
    const updatedContent = indexHtmlContent.slice(0, bodyCloseIndex) + redirectScript + indexHtmlContent.slice(bodyCloseIndex);
    
    // Write the updated content back to index.html
    fs.writeFileSync(indexHtmlPath, updatedContent);
    printMessage('Redirect handler added to index.html successfully!', colors.fg.green);
    
    return true;
  } catch (error) {
    printMessage(`Error creating redirect handler: ${error.message}`, colors.fg.red);
    return false;
  }
}

// Main function to run all fixes
async function applyComprehensiveFixes() {
  printHeader('Applying Comprehensive Next.js + Firebase Fixes');
  
  let success = true;
  
  // Step 1: Update Firebase configuration
  if (updateFirebaseConfig()) {
    printMessage('✓ Firebase configuration updated successfully', colors.fg.green);
  } else {
    printMessage('✗ Failed to update Firebase configuration', colors.fg.red);
    success = false;
  }
  
  // Step 2: Create enhanced 404 page
  if (create404Page()) {
    printMessage('✓ Enhanced 404 page created successfully', colors.fg.green);
  } else {
    printMessage('✗ Failed to create enhanced 404 page', colors.fg.red);
    success = false;
  }
  
  // Step 3: Create redirect handler
  if (createRedirectHandler()) {
    printMessage('✓ Redirect handler created successfully', colors.fg.green);
  } else {
    printMessage('✗ Failed to create redirect handler', colors.fg.red);
    success = false;
  }
  
  // Final status
  if (success) {
    printHeader('All Fixes Applied Successfully');
    printMessage('The comprehensive fixes for Next.js + Firebase have been applied successfully!', colors.fg.green);
    printMessage('\nNext steps:', colors.fg.cyan);
    printMessage('1. Deploy the changes using: ./redeploy-hosting.sh', colors.fg.white);
    printMessage('2. Test the website thoroughly to ensure all routes work correctly', colors.fg.white);
    printMessage('3. If issues persist, check the Firebase Hosting logs for more information', colors.fg.white);
  } else {
    printHeader('Some Fixes Failed');
    printMessage('Some of the fixes could not be applied. Please check the errors above and try again.', colors.fg.red);
  }
}

// Run the fixes
applyComprehensiveFixes().catch(error => {
  printMessage(`An unexpected error occurred: ${error.message}`, colors.fg.red);
  process.exit(1);
});
