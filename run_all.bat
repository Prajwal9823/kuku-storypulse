@echo off
TITLE KUKU STORYPULSE Launcher
cls
echo ===============================================================================
echo                KUKU STORYPULSE — COMPLETE SYSTEM LAUNCHER
echo          Turn Every Story Into Its Next Viral Hook (Problem 1)
echo ===============================================================================
echo.
echo [1] Verify Test Suite (10 Automated Unit Tests)
echo [2] Run Full Discovery Pipeline (Parses 50 Episodes, MMR Ranking, Exports)
echo [3] Start Full Application (Backend on :8000 + Frontend on :3000)
echo [4] Start Backend API Server Only (FastAPI :8000)
echo [5] Start Frontend Web App Only (Next.js :3000)
echo [6] Exit
echo.
set /p choice="Select an option [1-6]: "

if "%choice%"=="1" (
    echo.
    echo Running unit tests...
    python -m unittest discover tests
    echo.
    pause
    goto :eof
)

if "%choice%"=="2" (
    echo.
    echo Running end-to-end pipeline on 50 episodes...
    python backend/run_pipeline.py
    echo.
    pause
    goto :eof
)

if "%choice%"=="3" (
    echo.
    echo Launching FastAPI Backend on http://localhost:8000 ...
    start "Kuku StoryPulse Backend" cmd /k "cd backend && python app/main.py"
    timeout /t 2 >nul
    echo Launching Next.js Frontend on http://localhost:3000 ...
    start "Kuku StoryPulse Frontend" cmd /k "cd frontend && npm run dev"
    echo.
    echo All services started! Opening http://localhost:3000 in browser...
    start http://localhost:3000
    goto :eof
)

if "%choice%"=="4" (
    cd backend
    python app/main.py
    goto :eof
)

if "%choice%"=="5" (
    cd frontend
    npm run dev
    goto :eof
)

echo Exiting launcher.

