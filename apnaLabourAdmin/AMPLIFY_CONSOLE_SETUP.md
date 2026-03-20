# 🚨 AWS AMPLIFY CONSOLE MANUAL CONFIGURATION REQUIRED

## ⚠️ CRITICAL: The `amplify.yml` customHeaders may not work automatically in AWS Amplify

You need to **manually configure custom headers** in the AWS Amplify Console.

---

## 📋 Step-by-Step Instructions

### Step 1: Go to AWS Amplify Console

1. Open: https://console.aws.amazon.com/amplify
2. Select your app: **apnalabour** (or your app name)
3. Click on **Hosting** in the left sidebar

---

### Step 2: Configure Custom Headers

1. Click on **Rewrites and redirects** tab
2. Scroll down to **Custom headers** section
3. Click **Add custom header**

#### Header Configuration 1: Service Worker

**Source address pattern:**
```
/firebase-messaging-sw.js
```

**Header name:** `Content-Type`  
**Header value:** `application/javascript; charset=utf-8`

Click **Add header** button to add another header for the same pattern:

**Header name:** `Service-Worker-Allowed`  
**Header value:** `/`

**Header name:** `Cache-Control`  
**Header value:** `no-cache, no-store, must-revalidate`

Click **Save**

---

#### Header Configuration 2: All JavaScript Files

Click **Add custom header** again:

**Source address pattern:**
```
/*.js
```

**Header name:** `Content-Type`  
**Header value:** `application/javascript; charset=utf-8`

Click **Save**

---

### Step 3: Redeploy

After saving the custom headers:
1. Go to the **Build** tab
2. Click **Redeploy this version** on the latest successful build
3. Wait for the build to complete (~3-5 minutes)

---

### Step 4: Verify

After deployment completes:

1. **Clear your browser cache completely** (Ctrl + Shift + Delete)
2. **Open in Incognito/Private window**
3. Go to: `https://prod.dr039ttnpv9bq.amplifyapp.com/firebase-messaging-sw.js`
4. You should see JavaScript code (not HTML)

Check the Response Headers in DevTools → Network tab:
- ✅ `Content-Type: application/javascript; charset=utf-8`
- ✅ Status: `200 OK`

---

## 🔍 Alternative: Check if File Exists in Build

If headers don't help, verify the file is being deployed:

1. In AWS Amplify Console → **Build** tab
2. Click on latest build
3. View **Build logs**
4. Search for `firebase-messaging-sw.js`
5. Should see: `asset firebase-messaging-sw.js 876 bytes [emitted]`

If the file is NOT in the build logs:
- The webpack build failed
- Check build logs for errors

---

## 🛠️ If Still Not Working: CloudFront Cache

AWS Amplify uses CloudFront CDN which caches files. You may need to:

### Option 1: Wait for Cache Invalidation
- Wait 15-30 minutes for CloudFront cache to expire naturally

### Option 2: Manual Cache Invalidation
1. Go to AWS CloudFront Console
2. Find the distribution for your Amplify app
3. Go to **Invalidations** tab
4. Click **Create invalidation**
5. Enter path: `/firebase-messaging-sw.js`
6. Click **Create invalidation**
7. Wait 5-10 minutes

---

## 📸 Visual Guide for Custom Headers

In AWS Amplify Console, the custom headers section should look like this:

```
Custom headers

Source address pattern: /firebase-messaging-sw.js
├─ Content-Type: application/javascript; charset=utf-8
├─ Service-Worker-Allowed: /
└─ Cache-Control: no-cache, no-store, must-revalidate

Source address pattern: /*.js
└─ Content-Type: application/javascript; charset=utf-8
```

---

## 🔴 Common Issues

### Issue: Still getting 'text/html' MIME type
**Cause:** File doesn't exist (404 returns HTML error page)  
**Solution:** 
- Check build logs to verify file is being built
- Ensure `dist/firebase-messaging-sw.js` exists after local build
- Verify `amplify.yml` has `baseDirectory: dist`

### Issue: Headers not applying
**Cause:** CloudFront cache or configuration delay  
**Solution:**
- Wait 15 minutes
- Try incognito window
- Clear CloudFront cache (see above)

### Issue: Service worker still fails after file loads correctly
**Cause:** CORS or security policy  
**Solution:**
- Ensure HTTPS is enabled (AWS Amplify does this automatically)
- Check browser console for other errors
- Verify Firebase config is correct

---

## ✅ Success Checklist

Before testing, ensure:
- [x] Custom headers configured in Amplify Console
- [x] Latest code deployed
- [x] Waited 5-10 minutes after deployment
- [x] Browser cache cleared
- [x] Testing in incognito window
- [x] File accessible at: `https://prod.dr039ttnpv9bq.amplifyapp.com/firebase-messaging-sw.js`
- [x] Response headers show `application/javascript`

---

## 📞 Need Help?

If still not working after all steps:
1. Check AWS Amplify build logs for errors
2. Verify local build works: `npm run build && npx serve dist`
3. Test the exact URL in browser Network tab (F12)
4. Check for any AWS Amplify service issues

**Expected Result:**
- ✅ File loads with status 200
- ✅ Content-Type header: application/javascript
- ✅ File contains JavaScript (not HTML)
- ✅ Service worker registers successfully
- ✅ Console shows: "✅ Service Worker registered: ServiceWorkerRegistration {...}"

