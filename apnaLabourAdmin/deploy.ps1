# Deployment Script for AWS Amplify Manual Upload
# This script builds the project and creates a deployment-ready zip file

Write-Host "🚀 Starting deployment preparation..." -ForegroundColor Green

# Step 1: Clean previous build
Write-Host "`n📦 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "✅ Cleaned dist folder" -ForegroundColor Green
}

# Step 2: Build the project
Write-Host "`n🔨 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Step 3: Verify critical files
Write-Host "`n🔍 Verifying deployment files..." -ForegroundColor Yellow

$criticalFiles = @(
    "dist\index.html",
    "dist\bundle.js",
    "dist\_headers",
    "dist\_redirects",
    "dist\amplify.yml",
    "dist\sounds\notification.mp3",
    "dist\icons\location_icon.png"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ Some critical files are missing!" -ForegroundColor Red
    exit 1
}

# Step 4: Create deployment zip
Write-Host "`n📦 Creating deployment zip..." -ForegroundColor Yellow

$zipFile = "apnalabour-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"

# Remove old deployment zips
Get-ChildItem -Path "." -Filter "apnalabour-deploy-*.zip" | Remove-Item -Force

# Create new zip
Compress-Archive -Path "dist\*" -DestinationPath $zipFile -Force

if (Test-Path $zipFile) {
    $zipSize = (Get-Item $zipFile).Length / 1MB
    Write-Host "✅ Deployment zip created: $zipFile" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to create zip file!" -ForegroundColor Red
    exit 1
}

# Step 5: Show deployment instructions
Write-Host "`n📋 Deployment Instructions:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1. Go to AWS Amplify Console" -ForegroundColor White
Write-Host "2. Select your app: apnalabour" -ForegroundColor White
Write-Host "3. Click 'Manual deploys' or 'Deploy without Git'" -ForegroundColor White
Write-Host "4. Upload: $zipFile" -ForegroundColor Yellow
Write-Host "5. Wait for deployment to complete (~2-5 minutes)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Step 6: Show deployment contents
Write-Host "`n📂 Deployment Package Contents:" -ForegroundColor Cyan
Get-ChildItem -Path "dist" -Recurse | Select-Object FullName, @{Name="Size";Expression={"{0:N2} KB" -f ($_.Length / 1KB)}} | Format-Table -AutoSize

Write-Host "`n✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host "   Ready to upload: $zipFile" -ForegroundColor Yellow

