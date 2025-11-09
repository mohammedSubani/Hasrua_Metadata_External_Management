# PowerShell script to check Docker Desktop container mode and provide instructions

Write-Host "🔍 Checking Docker Desktop configuration..." -ForegroundColor Cyan
Write-Host ""

# Check Docker mode
$dockerInfo = docker info 2>&1
$osType = $dockerInfo | Select-String -Pattern "OSType:\s+(\w+)" | ForEach-Object { $_.Matches.Groups[1].Value }

if ($osType -eq "linux") {
    Write-Host "✅ Docker Desktop is in Linux container mode!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Cyan
    Write-Host "   docker compose up --build -d" -ForegroundColor White
    Write-Host ""
    exit 0
} elseif ($osType -eq "windows") {
    Write-Host "❌ Docker Desktop is in Windows container mode!" -ForegroundColor Red
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  ACTION REQUIRED: Switch to Linux Containers" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your application uses Linux images (node:20-alpine, nginx:alpine)" -ForegroundColor White
    Write-Host "which require Docker Desktop to be in Linux container mode." -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Steps to switch:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   1. Look for the Docker Desktop icon in your system tray" -ForegroundColor White
    Write-Host "      (bottom-right corner, near the clock)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. RIGHT-CLICK on the Docker Desktop icon" -ForegroundColor White
    Write-Host ""
    Write-Host "   3. Select 'Switch to Linux containers...'" -ForegroundColor White
    Write-Host ""
    Write-Host "   4. Wait for Docker Desktop to restart (30-60 seconds)" -ForegroundColor White
    Write-Host ""
    Write-Host "   5. Run this script again to verify:" -ForegroundColor White
    Write-Host "      .\check-docker-mode.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    
    # Try to open Docker Desktop settings
    $dockerDesktopPath = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktopPath) {
        Write-Host "💡 Tip: Opening Docker Desktop..." -ForegroundColor Cyan
        Start-Process $dockerDesktopPath
        Write-Host ""
    }
    
    Write-Host "After switching, you can run:" -ForegroundColor Cyan
    Write-Host "   docker compose up --build -d" -ForegroundColor White
    Write-Host ""
    exit 1
} else {
    Write-Host "⚠️  Could not determine Docker mode. Is Docker Desktop running?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please ensure Docker Desktop is running and try again." -ForegroundColor White
    exit 1
}

