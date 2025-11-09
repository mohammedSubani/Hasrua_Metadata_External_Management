# PowerShell script to build Docker images for Linux using buildx
# NOTE: This requires Docker Desktop to be in Linux container mode!

Write-Host "🐳 Building Docker images for Linux platform using buildx..." -ForegroundColor Cyan
Write-Host ""

# Check Docker mode first
$dockerInfo = docker info 2>&1
$osType = $dockerInfo | Select-String -Pattern "OSType:\s+(\w+)" | ForEach-Object { $_.Matches.Groups[1].Value }

if ($osType -eq "windows") {
    Write-Host "❌ ERROR: Docker Desktop is in Windows container mode!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Buildx cannot work properly in Windows container mode due to" -ForegroundColor Yellow
    Write-Host "limitations with privileged mode." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please switch Docker Desktop to Linux containers:" -ForegroundColor Cyan
    Write-Host "   1. Right-click Docker Desktop icon in system tray" -ForegroundColor White
    Write-Host "   2. Select 'Switch to Linux containers...'" -ForegroundColor White
    Write-Host "   3. Wait for Docker to restart" -ForegroundColor White
    Write-Host "   4. Run: .\check-docker-mode.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use: docker compose up --build -d (after switching)" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Check if buildx is available
$buildxVersion = docker buildx version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker buildx is not available. Please update Docker Desktop." -ForegroundColor Red
    exit 1
}

# Use the default builder (works in Linux container mode)
Write-Host "Setting up builder..." -ForegroundColor Cyan

# Try to use default builder first (it should work in Linux mode)
$builderCheck = docker buildx inspect default 2>&1
if ($LASTEXITCODE -eq 0) {
    # Default builder is available, use it
    Write-Host "✅ Using default builder" -ForegroundColor Green
} else {
    # Try desktop-linux builder
    $linuxBuilderCheck = docker buildx inspect desktop-linux 2>&1
    if ($LASTEXITCODE -eq 0) {
        docker buildx use desktop-linux 2>&1 | Out-Null
        Write-Host "✅ Using desktop-linux builder" -ForegroundColor Green
    } else {
        # Create a new builder
        Write-Host "Creating new Linux builder..." -ForegroundColor Cyan
        $newBuilderName = "linux-builder-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        docker buildx create --name $newBuilderName --use --platform linux/amd64 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to create builder" -ForegroundColor Red
            Write-Host "Please ensure Docker Desktop is in Linux container mode." -ForegroundColor Yellow
            exit 1
        }
        Write-Host "✅ Created and using new builder: $newBuilderName" -ForegroundColor Green
    }
}

Write-Host ""

# Build the client image
Write-Host "Building client image..." -ForegroundColor Cyan
$clientContext = "./hasurarolesmanagement.client"
$hasuraEndpoint = $env:HASURA_ENDPOINT
if (-not $hasuraEndpoint) {
    $hasuraEndpoint = "https://192.168.200.141/v1/metadata"
}
$hasuraSecret = $env:HASURA_ADMIN_SECRET
if (-not $hasuraSecret) {
    $hasuraSecret = "myadminsecretkey"
}

docker buildx build `
    --platform linux/amd64 `
    --build-arg "VITE_HASURA_ENDPOINT=$hasuraEndpoint" `
    --build-arg "VITE_HASURA_ADMIN_SECRET=$hasuraSecret" `
    --tag hasura-roles-client:latest `
    --load `
    --file "$clientContext/Dockerfile" `
    $clientContext

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Client image built successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting container..." -ForegroundColor Cyan
    docker run -d --name hasura-roles-client -p 3000:80 --rm hasura-roles-client:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Container started!" -ForegroundColor Green
        Write-Host "   Client available at: http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start container" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

