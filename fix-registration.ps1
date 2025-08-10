# PowerShell script to diagnose and fix trade registration issues

Write-Host "=== Supabase Trade Registration System Diagnostic Tool ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
Write-Host "Checking environment files..." -ForegroundColor Yellow
if (Test-Path .\.env.local) {
    Write-Host "✅ .env.local file exists" -ForegroundColor Green
    
    # Check if it has the required variables (without showing values)
    $envContent = Get-Content .\.env.local -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "✅ NEXT_PUBLIC_SUPABASE_URL is defined" -ForegroundColor Green
    } else {
        Write-Host "❌ NEXT_PUBLIC_SUPABASE_URL is missing" -ForegroundColor Red
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is defined" -ForegroundColor Green
    } else {
        Write-Host "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env.local file is missing" -ForegroundColor Red
    Write-Host "Creating .env.local file with Supabase credentials..." -ForegroundColor Yellow
    
    @"
NEXT_PUBLIC_SUPABASE_URL=https://zaheoihrevtsnzrcswhn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphaGVvaWhyZXZ0c256cmNzd2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTU3MzQsImV4cCI6MjA2NTIzMTczNH0.SoxziWcNenWFqZ61BIzNZyJFA2w8kZil7llu4lINXBw
NEXT_PUBLIC_SITE_URL=http://localhost:3000
"@ | Out-File -FilePath .\.env.local -Encoding utf8
    
    if (Test-Path .\.env.local) {
        Write-Host "✅ Created .env.local file with credentials" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create .env.local file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking if Next.js server is running..." -ForegroundColor Yellow
$nextProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*next*"} 

if ($nextProcesses) {
    Write-Host "Found running Next.js processes:" -ForegroundColor Green
    $nextProcesses | ForEach-Object { Write-Host "PID: $($_.Id)" -ForegroundColor Green }
    
    Write-Host "Stopping existing Next.js processes..." -ForegroundColor Yellow
    $nextProcesses | Stop-Process -Force
    Write-Host "✅ Stopped existing Next.js processes" -ForegroundColor Green
} else {
    Write-Host "No running Next.js processes found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Would you like to start the Next.js server now? (Y/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
    Write-Host "IMPORTANT: Open http://localhost:3000/test-api in your browser" -ForegroundColor Magenta
    Write-Host "Press Ctrl+C to stop the server when done" -ForegroundColor Yellow
    
    # Start the Next.js server
    npm run dev
} else {
    Write-Host "To manually start the server, run: npm run dev" -ForegroundColor Yellow
    Write-Host "Then visit: http://localhost:3000/test-api" -ForegroundColor Yellow
}
