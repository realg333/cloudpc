# sleep.ps1 — Quick checkpoint before ending a work session
# Usage: .\sleep.ps1 [-Push]
# Calls checkpoint.ps1 with default message "checkpoint before sleep"

param(
    [switch]$Push
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CheckpointScript = Join-Path $ScriptDir "checkpoint.ps1"

& $CheckpointScript -Message "checkpoint before sleep" -Push:$Push
