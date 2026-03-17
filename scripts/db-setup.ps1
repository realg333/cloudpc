# Database setup - run when PostgreSQL is running
# Usage: .\scripts\db-setup.ps1
# Prisma loads .env automatically.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Applying schema..."
npx prisma db push

Write-Host "Seeding database..."
npx prisma db seed

Write-Host "Database setup complete."
