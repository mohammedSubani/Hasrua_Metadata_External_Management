# Docker Troubleshooting Guide

## Platform Mismatch Error: "no matching manifest for windows/amd64"

### Problem
You're seeing an error like:
```
no matching manifest for windows/amd64 10.0.26100 in the manifest list entries
```

This happens when Docker Desktop is running in **Windows container mode**, but your Dockerfiles are trying to use **Linux images** (like `node:20-alpine`, `nginx:alpine`, etc.).

### Solution 1: Switch Docker Desktop to Linux Containers (Recommended)

1. **Right-click** the Docker Desktop icon in your system tray (bottom-right corner)
2. Select **"Switch to Linux containers..."**
3. Wait for Docker Desktop to restart (this may take 30-60 seconds)
4. Verify the switch:
   ```powershell
   docker info | Select-String -Pattern "OSType"
   ```
   You should see: `OSType: linux`
5. Run your docker-compose command again:
   ```powershell
   docker compose up --build -d
   ```

### Solution 2: Use Docker Buildx (Requires Linux Container Mode)

**Note:** Buildx also requires Docker Desktop to be in Linux container mode. The `docker-build-linux.ps1` script will check this and provide instructions if needed.

```powershell
.\docker-build-linux.ps1
```

**Important:** Buildx cannot work in Windows container mode due to privileged mode limitations. You must switch to Linux containers first.

### Solution 3: Check Docker Mode

Use the provided script to check your Docker configuration:

```powershell
.\check-docker-mode.ps1
```

This script will:
- Check if Docker Desktop is in Linux or Windows container mode
- Provide step-by-step instructions if switching is needed
- Verify the configuration after switching

### Verification

After switching to Linux containers, verify:

```powershell
# Check Docker mode
docker info | Select-String -Pattern "OSType"
# Should output: OSType: linux

# Check available platforms
docker buildx ls
# Should show linux/amd64 as available platform
```

### Additional Requirements

Make sure Docker Desktop has:
- **WSL 2** enabled (Settings → General → "Use WSL 2 based engine")
- **Enough resources** allocated:
  - At least 4GB RAM
  - 2+ CPU cores
  - 20GB+ disk space

### Why This Happens

Docker Desktop on Windows can run in two modes:
- **Windows containers**: For Windows-based images (nanoserver, windowsservercore)
- **Linux containers**: For Linux-based images (alpine, ubuntu, etc.)

Most modern applications use Linux containers because they're:
- Smaller in size
- More widely supported
- Better for cross-platform development

Your application uses Linux images (`node:20-alpine`, `nginx:alpine`), so Docker Desktop must be in Linux container mode.

### Still Having Issues?

1. **Restart Docker Desktop** completely
2. **Update Docker Desktop** to the latest version
3. **Check WSL 2** is installed and updated:
   ```powershell
   wsl --status
   wsl --update
   ```
4. **Clear Docker cache**:
   ```powershell
   docker system prune -a
   ```

