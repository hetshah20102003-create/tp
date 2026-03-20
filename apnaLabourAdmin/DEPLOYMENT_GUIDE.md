# FCM Service Worker Deployment Fix - Guide

## Problem Summary
The Firebase Cloud Messaging (FCM) service worker was failing to register in production with the error:
```
SecurityError: Failed to register a ServiceWorker with script: 
The script has an unsupported MIME type ('text/html')
```

## Root Cause
The `firebase-messaging-sw.js` file was not being copied to the `dist/` folder during the webpack build process, causing the server to return a 404 HTML page instead of the JavaScript file.

## Fixes Applied

### 1. ✅ Installed `copy-webpack-plugin`
```bash
npm install --save-dev copy-webpack-plugin
```

### 2. ✅ Updated `webpack.config.js`
Added CopyWebpackPlugin to copy all static assets from `public/` to `dist/`:
```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');

// In plugins array:
new CopyWebpackPlugin({
  patterns: [
    {
      from: 'public',
      to: '',
      globOptions: {
        ignore: ['**/index.html'], // HtmlWebpackPlugin handles this
      },
    },
  ],
}),
```

### 3. ✅ Created `amplify.yml`
Added AWS Amplify build configuration with proper MIME type headers:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  customHeaders:
    - pattern: 'firebase-messaging-sw.js'
      headers:
        - key: 'Content-Type'
          value: 'application/javascript'
        - key: 'Service-Worker-Allowed'
          value: '/'
```

### 4. ✅ Created `public/_headers`
Added Netlify/Amplify-style headers file for additional MIME type configuration:
```
/firebase-messaging-sw.js
  Content-Type: application/javascript
  Service-Worker-Allowed: /
  Cache-Control: no-cache
```

### 5. ✅ Fixed Missing Import in `src/App.js`
Added missing import for `requestForToken`:
```javascript
import { requestForToken, listenForMessages } from "./firebase";
```

## Deployment Steps for AWS Amplify

### Option 1: Using Amplify Console (Recommended)

1. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Fix: FCM service worker registration and MIME type issues"
   git push origin main
   ```

2. **Amplify Will Auto-Deploy**
   - Amplify will automatically detect the `amplify.yml` file
   - The build will run: `npm ci && npm run build`
   - All files from `dist/` will be deployed
   - Custom headers will be applied

3. **Verify the Deployment**
   - Visit: `https://prod.dr039ttnpv9bq.amplifyapp.com/firebase-messaging-sw.js`
   - You should see JavaScript code, not an HTML error page
   - Response headers should include: `Content-Type: application/javascript`

### Option 2: Manual Configuration in Amplify Console

If `amplify.yml` is not picked up automatically:

1. **Go to AWS Amplify Console**
2. **Select Your App** → **Build Settings**
3. **Update Build Specification**
   - Replace with contents from `amplify.yml`
4. **Go to Rewrites and redirects**
   - Add custom headers:
     - Source: `/firebase-messaging-sw.js`
     - Type: `Set a Custom Header`
     - Key: `Content-Type`
     - Value: `application/javascript`

## Verification Steps After Deployment

### 1. Check Service Worker File
Open in browser:
```
https://prod.dr039ttnpv9bq.amplifyapp.com/firebase-messaging-sw.js
```
You should see the JavaScript code, not an error page.

### 2. Check Response Headers
In Chrome DevTools:
1. Open **Network** tab
2. Reload page
3. Find `firebase-messaging-sw.js`
4. Check **Headers** → Should show:
   - `Content-Type: application/javascript`
   - Status: `200 OK`

### 3. Check Browser Console
1. Open your app
2. Open DevTools → Console
3. You should see:
   ```
   ✅ Service Worker registered: ServiceWorkerRegistration {...}
   ✅ FCM Token: [your-token]
   ```

### 4. Test Notifications
1. Send a test notification from Firebase Console
2. You should receive it both when:
   - App is in foreground (toast notification)
   - App is in background (system notification)

## Files Changed
- ✅ `webpack.config.js` - Added copy-webpack-plugin
- ✅ `package.json` - Added copy-webpack-plugin dependency
- ✅ `amplify.yml` - NEW - AWS Amplify build configuration
- ✅ `public/_headers` - NEW - Custom headers for service worker
- ✅ `src/App.js` - Fixed missing import
- ✅ `dist/firebase-messaging-sw.js` - Now properly copied during build
- ✅ `dist/_headers` - Now included in build output

## Common Issues and Solutions

### Issue: Still getting MIME type error after deployment
**Solution:** 
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check Amplify build logs to ensure `npm run build` completed successfully
- Verify `dist/firebase-messaging-sw.js` exists in build artifacts

### Issue: Service worker not updating
**Solution:**
- Service workers are heavily cached
- Add `?v=2` to the registration URL temporarily:
  ```javascript
  navigator.serviceWorker.register('/firebase-messaging-sw.js?v=2');
  ```
- Or update the Cache-Control header to `no-cache`

### Issue: 404 on service worker file
**Solution:**
- Ensure `amplify.yml` is in the root directory
- Check Amplify Console → Build Settings → baseDirectory is set to `dist`
- Verify the file exists in the build output

## Testing Locally

To test the build locally:
```bash
# Build the project
npm run build

# Verify service worker exists
ls dist/firebase-messaging-sw.js

# Serve locally (install serve if needed)
npx serve dist

# Open http://localhost:3000 and test
```

## Support

If you continue to experience issues:
1. Check Amplify build logs in AWS Console
2. Verify the `dist/` folder contains `firebase-messaging-sw.js`
3. Check browser Network tab for the actual response
4. Ensure Firebase configuration is correct in both files

## Next Steps

After successful deployment:
- ✅ Monitor Firebase Console for active tokens
- ✅ Test notification delivery
- ✅ Set up notification templates
- ✅ Configure notification triggers from backend

