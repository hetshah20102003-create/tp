#!/bin/bash

# Deployment Script for AWS Amplify Manual Upload (macOS/Linux)
# This script builds the project and creates a deployment-ready zip file

echo "🚀 Starting deployment preparation..."

# Step 1: Clean previous build
# echo -e "\n📦 Cleaning previous build..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "✅ Cleaned dist folder"
fi

# Step 2: Build the project
# echo -e "\n🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully"

# Step 3: Verify critical files
# echo -e "\n🔍 Verifying deployment files..."

critical_files=(
    "dist/index.html"
    "dist/bundle.js"
    "dist/_headers"
    "dist/_redirects"
    "dist/amplify.yml"
    "dist/sounds/notification.mp3"
    "dist/icons/location_icon.png"
)

all_files_exist=true

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo -e "\n❌ Some critical files are missing!"
    exit 1
fi

# Step 4: Create deployment zip
# echo -e "\n📦 Creating deployment zip..."

timestamp=$(date +'%Y%m%d-%H%M%S')
zip_file="apnalabour-deploy-${timestamp}.zip"

# Remove old deployment zips
rm -f apnalabour-deploy-*.zip

# Create new zip
# -r recurse, -j junk paths (optional, but we want dist structure or contents?)
# deploy.ps1 uses Compress-Archive -Path "dist\*" which puts contents at root of zip usually if * is used.
# Let's cd into dist and zip to avoid 'dist/' prefix if that's what Amplify expects.
# However, usually manual deploy expects content at root.
# Let's zip the CONTENTS of dist.
cd dist
zip -r "../${zip_file}" .
cd ..

if [ -f "$zip_file" ]; then
    zip_size=$(du -h "$zip_file" | cut -f1)
    echo "✅ Deployment zip created: $zip_file"
    echo "   Size: $zip_size"
else
    echo "❌ Failed to create zip file!"
    exit 1
fi

# Step 5: Show deployment contents
# echo -e "\n📂 Deployment Package Contents:"
# unzip -l "$zip_file"

# Step 6: Show deployment instructions
echo -e "\n📋 Deployment Instructions:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Select your app: apnalabour"
echo "3. Click 'Manual deploys' or 'Deploy without Git'"
echo "4. Upload: $zip_file"
echo "5. Wait for deployment to complete (~2-5 minutes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "\n✅ Deployment preparation complete!"
echo "   Ready to upload: $zip_file"
