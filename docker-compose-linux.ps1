# PowerShell script to run Docker Compose with Linux containers
# This script checks Docker mode and sets the DOCKER_DEFAULT_PLATFORM environment variable

Write-Host "🐳 Setting up Docker for Linux containers..." -ForegroundColor Cyan
Write-Host ""

# Check Docker mode first
$dockerInfo = docker info 2>&1
$osType = $dockerInfo | Select-String -Pattern "OSType:\s+(\w+)" | ForEach-Object { $_.Matches.Groups[1].Value }

if ($osType -eq "windows") {
    Write-Host "❌ ERROR: Docker Desktop is in Windows container mode!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please switch Docker Desktop to Linux containers:" -ForegroundColor Cyan
    Write-Host "   1. Right-click Docker Desktop icon in system tray" -ForegroundColor White
    Write-Host "   2. Select 'Switch to Linux containers...'" -ForegroundColor White
    Write-Host "   3. Wait for Docker to restart" -ForegroundColor White
    Write-Host "   4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run: .\check-docker-mode.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
} elseif ($osType -ne "linux") {
    Write-Host "⚠️  Could not determine Docker mode. Is Docker Desktop running?" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Docker Desktop is in Linux container mode!" -ForegroundColor Green
Write-Host ""

# Set environment variable for Linux platform
$env:DOCKER_DEFAULT_PLATFORM = "linux/amd64"

Write-Host "Building and starting containers..." -ForegroundColor Cyan
Write-Host ""

# Run docker compose
docker compose up --build -d

# Check if it succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Containers started successfully!" -ForegroundColor Green
    Write-Host "   Client available at: http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Please ensure:" -ForegroundColor Red
    Write-Host "   1. Docker Desktop is switched to Linux containers mode" -ForegroundColor Red
    Write-Host "   2. Docker Desktop has enough resources allocated (4GB+ RAM)" -ForegroundColor Red
    Write-Host "   3. WSL 2 is enabled (Settings -> General -> Use WSL 2 based engine)" -ForegroundColor Red
}

