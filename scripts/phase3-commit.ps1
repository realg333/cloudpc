# Phase 3 commit script - run when Git is installed and in PATH
# Usage: .\scripts\phase3-commit.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

# Ensure git is available
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Error "Git is not in PATH. Install Git for Windows from https://git-scm.com/download/win"
    exit 1
}

# Init if needed
if (-not (Test-Path .git)) {
    git init
    Write-Host "Git repository initialized."
}

# Stage all
git add -A
$status = git status --short
if (-not $status) {
    Write-Host "No changes to commit (working tree clean)."
    exit 0
}

# Commit
git commit -m "phase 3: VM provisioning implementation"
Write-Host "Commit created successfully."
