# checkpoint.ps1 - Create a development checkpoint for safe pause/resume
# Usage: .\checkpoint.ps1 [-Message "commit message"] [-Push]

param(
    [string]$Message = "checkpoint",
    [switch]$Push
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot  # scripts/ is under project root
$CheckpointDir = Join-Path $ProjectRoot ".checkpoint"

# Ensure .checkpoint exists
if (-not (Test-Path $CheckpointDir)) {
    New-Item -ItemType Directory -Path $CheckpointDir -Force | Out-Null
}

# --- Gather state ---
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$Branch = "n/a"
$Commit = "n/a"
$GitStatus = "Git not available or not a repository"
$DiffSummary = "n/a"
$HasGit = $false

# Check if git is available and we're in a repo
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if ($gitCmd) {
    Push-Location $ProjectRoot
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"  # Git writes warnings to stderr; Stop would treat them as errors
    try {
        $gitRoot = git rev-parse --show-toplevel 2>$null
        if ($LASTEXITCODE -eq 0) {
            $HasGit = $true
            $Branch = git rev-parse --abbrev-ref HEAD 2>$null
            if (-not $Branch) { $Branch = "detached" }
            $Commit = git rev-parse --short HEAD 2>$null
            if (-not $Commit) { $Commit = "unknown" }
            $GitStatus = git status 2>$null | Out-String
            $diffOut = git diff --stat 2>$null | Out-String
            $diffStaged = git diff --cached --stat 2>$null | Out-String
            if ($diffOut.Trim() -or $diffStaged.Trim()) {
                $DiffSummary = "Staged:" + [Environment]::NewLine + $diffStaged + "Unstaged:" + [Environment]::NewLine + $diffOut
            } else {
                $DiffSummary = "No local changes"
            }
        }
    } finally {
        $ErrorActionPreference = $prevEAP
        Pop-Location
    }
}

# --- Read STATE.md for progress ---
$StatePath = Join-Path (Join-Path $ProjectRoot ".planning") "STATE.md"
$Milestone = "v1.0"
$CurrentPhase = "Phase 1 - Foundation and Accounts"
$LastCompleted = "See STATE.md"
$NextUp = "See STATE.md"

if (Test-Path $StatePath) {
    $stateContent = Get-Content $StatePath -Raw
    if ($stateContent -match "Current phase:\s*(\d+)") { $CurrentPhase = "Phase " + $Matches[1] }
    if ($stateContent -match "milestone:\s*(\S+)") { $Milestone = $Matches[1] }
}

# --- Generate HANDOFF.md from template ---
$TemplatePath = Join-Path $CheckpointDir "HANDOFF.template.md"
$HandoffPath = Join-Path $CheckpointDir "HANDOFF.md"

if (-not (Test-Path $TemplatePath)) {
    Write-Host "Error: HANDOFF.template.md not found" -ForegroundColor Red
    exit 1
}

$HandoffContent = (Get-Content $TemplatePath -Raw)
$HandoffContent = $HandoffContent -replace "{{TIMESTAMP}}", $Timestamp
$HandoffContent = $HandoffContent -replace "{{BRANCH}}", $Branch
$HandoffContent = $HandoffContent -replace "{{COMMIT}}", $Commit
$HandoffContent = $HandoffContent -replace "{{GIT_STATUS}}", $GitStatus
$HandoffContent = $HandoffContent -replace "{{DIFF_SUMMARY}}", $DiffSummary
$HandoffContent = $HandoffContent -replace "{{MILESTONE}}", $Milestone
$HandoffContent = $HandoffContent -replace "{{CURRENT_PHASE}}", $CurrentPhase
$HandoffContent = $HandoffContent -replace "{{LAST_COMPLETED}}", $LastCompleted
$HandoffContent = $HandoffContent -replace "{{NEXT_UP}}", $NextUp

Set-Content -Path $HandoffPath -Value $HandoffContent -Encoding UTF8

# --- Ensure RESUME_PROMPT.md exists (static template) ---
$ResumePath = Join-Path $CheckpointDir "RESUME_PROMPT.md"
$ResumeTemplatePath = Join-Path $CheckpointDir "RESUME_PROMPT.template.md"

if (Test-Path $ResumeTemplatePath) {
    Copy-Item $ResumeTemplatePath $ResumePath -Force
} elseif (-not (Test-Path $ResumePath)) {
    $ResumeContent = @"
# Resume Development - Cloud Gaming VPS Brazil

I'm resuming work on this GSD-based project. Please load context and continue from where we left off.

## Instructions for the AI

1. **Read these files first** (in order):
   - .planning/PROJECT.md
   - .planning/REQUIREMENTS.md
   - .planning/ROADMAP.md
   - .planning/STATE.md
   - .checkpoint/HANDOFF.md

2. **Understand the current state:**
   - Check the HANDOFF.md timestamp, git branch, and diff summary.
   - Note the current phase and what was last completed vs. next up.

3. **Continue work:**
   - Do NOT change project architecture or core business logic.
   - Do NOT restart planning.
   - Pick up from the "Next up" item in HANDOFF.md, or ask me what to focus on.

## Project Summary

- **Name:** Cloud Gaming VPS Brazil
- **Goal:** Cloud gaming rental platform for Brazilian users - fixed-time GPU cloud PCs, Parsec connection, web dashboard.
- **Stack:** Next.js frontend, Node.js backend, Vultr GPU VMs, PIX/crypto payments.

## Quick Reference

- Planning root: .planning/
- Phase directories: .planning/phases/01-foundation-accounts/, etc.
- Checkpoint folder: .checkpoint/
"@
    Set-Content -Path $ResumePath -Value $ResumeContent -Encoding UTF8
}

Write-Host "Checkpoint created: $HandoffPath" -ForegroundColor Green

# --- Git operations ---
if ($HasGit) {
    Push-Location $ProjectRoot
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        git add .
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Warning: git add failed" -ForegroundColor Yellow
        } else {
            git commit -m $Message 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Committed: $Message" -ForegroundColor Green
                if ($Push) {
                    git push 2>&1 | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "Pushed to remote" -ForegroundColor Green
                    } else {
                        Write-Host "Warning: git push failed" -ForegroundColor Yellow
                    }
                }
            } else {
                Write-Host "Nothing to commit (working tree clean) or commit failed" -ForegroundColor Yellow
            }
        }
    } finally {
        $ErrorActionPreference = $prevEAP
        Pop-Location
    }
} else {
    Write-Host "Git not available - HANDOFF.md and RESUME_PROMPT.md created; no commit." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To resume: Open .checkpoint/RESUME_PROMPT.md and paste its contents into a new Cursor chat." -ForegroundColor Cyan
