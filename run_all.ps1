# KUKU STORYPULSE — PowerShell Launcher
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "               KUKU STORYPULSE — COMPLETE SYSTEM LAUNCHER" -ForegroundColor Yellow
Write-Host "         Turn Every Story Into Its Next Viral Hook (Problem 1)" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1] Verify Test Suite (10 Automated Unit Tests)" -ForegroundColor Green
Write-Host "[2] Run Full Discovery Pipeline (Parses 50 Episodes, MMR Ranking, Exports)" -ForegroundColor Green
Write-Host "[3] Start Full Application (Backend on :8000 + Frontend on :3000)" -ForegroundColor Green
Write-Host "[4] Start Backend API Server Only (FastAPI :8000)" -ForegroundColor Green
Write-Host "[5] Start Frontend Web App Only (Next.js :3000)" -ForegroundColor Green
Write-Host "[6] Exit" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Select an option [1-6]"

switch ($choice) {
    "1" {
        python -m unittest discover tests
    }
    "2" {
        python backend/run_pipeline.py
    }
    "3" {
        Write-Host "Starting Backend on http://localhost:8000..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'backend'; python app/main.py"
        Start-Sleep -Seconds 2
        Write-Host "Starting Frontend on http://localhost:3000..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'frontend'; npm run dev"
        Start-Sleep -Seconds 1
        Start-Process "http://localhost:3000"
    }
    "4" {
        Set-Location "backend"
        python app/main.py
    }
    "5" {
        Set-Location "frontend"
        npm run dev
    }
    Default {
        Write-Host "Exiting." -ForegroundColor Yellow
    }
}

