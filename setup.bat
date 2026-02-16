@echo off
REM SyncChat Setup Script for Windows
REM This script automates the setup process for development

echo.
echo ========================================
echo    SyncChat Setup Script (Windows)
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Setup Backend
echo ========================================
echo Setting up Backend...
echo ========================================
cd backend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [WARNING] Please edit backend\.env with your configuration
) else (
    echo [OK] .env file already exists
)

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend dependencies installed
) else (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

cd ..
echo.

REM Setup Frontend
echo ========================================
echo Setting up Frontend...
echo ========================================
cd frontend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [WARNING] Please edit frontend\.env with your configuration
) else (
    echo [OK] .env file already exists
)

echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend dependencies installed
) else (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..
echo.

REM Summary
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Edit backend\.env with your MongoDB URI and JWT secret
echo 2. Edit frontend\.env with your backend URL
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm start
echo.
echo For more information, see QUICKSTART.md
echo.
pause
