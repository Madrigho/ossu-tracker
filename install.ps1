$ErrorActionPreference = "Stop"

$repo = "https://github.com/Madrigho/ossu-tracker.git"
$dest = Join-Path $env:USERPROFILE "dev\ossu-tracker"
$desktopBat = Join-Path ([Environment]::GetFolderPath("Desktop")) "OSSU Tracker.bat"

Write-Host ""
Write-Host "OSSU CS Progress Tracker - installer"
Write-Host "------------------------------------"
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed."
    Write-Host "Download it from https://git-scm.com/download/win"
    Write-Host "Install with all default options, then run this again."
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed."
    Write-Host "Download it from https://nodejs.org/ (choose the LTS button)"
    Write-Host "Install with all default options, then run this again."
    exit 1
}

if (Test-Path $dest) {
    Write-Host "Found an existing install at $dest"
    Write-Host "Updating to the latest version..."
    Set-Location $dest
    git pull
} else {
    Write-Host "Downloading the tracker to $dest"
    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    git clone $repo $dest
    Set-Location $dest
}

Write-Host "Installing dependencies (about one minute the first time)..."
npm install --silent

# Create a Desktop launcher
$batBody = @"
@echo off
powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location `"$dest`"; Start-Process 'http://localhost:1420'; npm run dev"
"@
Set-Content -Path $desktopBat -Value $batBody -Encoding ascii
Write-Host "Desktop launcher created: $desktopBat"

Write-Host ""
Write-Host "Starting the tracker at http://localhost:1420"
Write-Host "Leave this window open while you use the tracker."
Write-Host "Next time, just double-click 'OSSU Tracker.bat' on your Desktop."
Write-Host "Press Ctrl+C to stop."
Write-Host ""

Start-Process "http://localhost:1420"
npm run dev
