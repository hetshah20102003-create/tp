# 📦 Manual Deployment Guide for AWS Amplify

This guide explains how to manually deploy your app to AWS Amplify by uploading a zip file.

> [!NOTE]
> This guide covers both Windows (PowerShell) and Mac/Linux (Bash) deployment methods.

---

## 🚀 Quick Deploy (Easiest Method)

### Step 1: Run the Deployment Script

### For Windows Users (PowerShell)

```powershell
.\deploy.ps1
```

### For Mac/Linux Users (Bash)

First, make the script executable (only needed once):
```bash
chmod +x deploy.sh
```

Then run the script:
```bash
./deploy.sh
```

This automated script will:
- ✅ Clean previous builds
- ✅ Build the project with webpack
- ✅ Verify all critical files (amplify.yml, sounds, icons, etc.)
- ✅ Create a timestamped zip file
- ✅ Show you deployment instructions

### Step 2: Upload to AWS Amplify

1. **Go to AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. **Select your app**: `apnalabour`
3. **Navigate to**: "Manual deploys" or "Deploy without Git"
4. **Upload**: `apnalabour-deploy-YYYYMMDD-HHMMSS.zip` (created by script)
5. **Wait**: ~2-5 minutes for deployment to complete

---

## 🛠️ Manual Build & Deploy (If Script Fails)

### Step 1: Build the Project

```bash
# Windows
npm run build

# Mac/Linux
npm run build
```

### Step 2: Verify Critical Files Exist

Check that these files exist in the `dist` folder:

```
dist/
  ├── index.html              ✅
  ├── bundle.js               ✅
  ├── amplify.yml             ✅ (Important!)
  ├── _redirects              ✅
  ├── _headers                ✅
  ├── sounds/
  │   └── notification.mp3    ✅
  └── icons/
      └── location_icon.png   ✅
```

### Step 3: Create Zip File

**Windows (PowerShell)**:
```powershell
Compress-Archive -Path dist\* -DestinationPath deploy.zip -Force
```

**Mac/Linux (Terminal)**:
```bash
cd dist
zip -r ../deploy.zip .
cd ..
```

### Step 4: Upload to AWS Amplify

Same as above - upload `deploy.zip` to AWS Amplify Console.

---

## ✅ What's Fixed in This Build?

### 1. Static Assets Now Load Correctly
- **Fixed**: `_redirects` file now allows direct access to `/sounds/` and `/icons/`
- **Fixed**: `_headers` file includes proper MIME types for audio and images
- **Fixed**: `amplify.yml` is now included in the zip for manual deploys

### 2. Audio Notifications Work
- **Fixed**: Multiple fallback methods for audio playback
- **Fixed**: Explicit MIME type specification for MP3 files
- **Fixed**: Web Audio API fallback for maximum compatibility

### 3. No More FCM Token Errors
- **Fixed**: FCM setup now waits for user authentication
- **Fixed**: Better error handling and logging

### 4. Session Persistence
- **Working**: AWS Amplify automatically maintains sessions for 30 days
- **Note**: Sessions stored in browser localStorage

---

## 📂 Deployment Package Contents

Your deployment zip includes:

| File/Folder | Purpose | Size |
|-------------|---------|------|
| `index.html` | Main HTML entry point | 0.6 KB |
| `bundle.js` | App JavaScript bundle | ~837 KB |
| `amplify.yml` | **AWS Amplify config** | 1.2 KB |
| `_redirects` | **Static asset routing rules** | 0.4 KB |
| `_headers` | **MIME types & caching** | 0.5 KB |
| `sounds/notification.mp3` | Notification sound | 67 KB |
| `icons/location_icon.png` | Location icon | 15 KB |
| `firebase-messaging-sw.js` | Service worker for FCM | 0.9 KB |

**Total Size**: ~0.33 MB compressed

---

## 🔍 Verifying Deployment Success

### After deployment, test these URLs:

1. **Main App**: `https://your-app.amplifyapp.com/`
   - Should load the admin dashboard

2. **Audio File**: `https://your-app.amplifyapp.com/sounds/notification.mp3`
   - Should play/download the MP3 (NOT show HTML)

3. **Icon File**: `https://your-app.amplifyapp.com/icons/location_icon.png`
   - Should display the image (NOT show HTML)

### In Browser Console:

You should see these logs after login:
```
🔐 Checking authentication status...
✅ User is authenticated, fetching user data...
✅ User data loaded: {...}
🔊 Audio initialization started
✅ Audio preloaded successfully
✅ FCM token saved successfully for user: xxx
```

---

## ❌ Troubleshooting

### Problem: "Audio still not playing"

**Solution**: Clear browser cache and hard reload:
- Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

The old version might be cached with the broken `_redirects` file.

### Problem: "Can't find amplify.yml"

**Verify**: 
```powershell
Test-Path "dist\amplify.yml"
```

Should return `True`. If `False`, run:
```powershell
npm run build
```

### Problem: "Still getting FCM token errors"

**Check**: 
1. Make sure you're logged in
2. Check console for: `⏳ Waiting for user authentication before FCM setup...`
3. After login, you should see: `✅ FCM token saved successfully`

---

## 🔄 Update Workflow

When you make changes:

1. **Edit your code** (e.g., `src/App.js`)
2. **Run deployment script**:
   ```powershell
   .\deploy.ps1
   ```
3. **Upload new zip** to AWS Amplify
4. **Wait for deployment** (~2-5 minutes)
5. **Test your changes**

---

## 📝 Important Files Changed

### `webpack.config.js`
```javascript
// Now copies amplify.yml to dist folder
new CopyWebpackPlugin({
  patterns: [
    { from: 'amplify.yml', to: 'amplify.yml' },
    // ... other patterns
  ],
}),
```
```

### `public/_redirects`
```nginx
# Serve static assets directly (BEFORE catch-all)
/sounds/*  /sounds/:splat  200
/icons/*   /icons/:splat   200
/*.mp3     /:splat.mp3     200

# SPA fallback (AFTER static assets)
/*    /index.html   200
```

### `public/_headers`
```nginx
# Audio files
/sounds/*.mp3
  Content-Type: audio/mpeg
  Cache-Control: public, max-age=31536000
```

---

## 🎯 Summary

✅ **amplify.yml is now included in dist folder**  
✅ **Automated deployment script created**  
✅ **Static assets properly configured**  
✅ **Audio playback with multiple fallbacks**  
✅ **FCM token errors fixed**  
✅ **Session persistence working**  

**Ready to Deploy!** 🚀

Run: `.\deploy.ps1` and upload the generated zip file.

