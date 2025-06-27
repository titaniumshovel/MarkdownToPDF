@echo off
echo Starting Markdown to PDF Converter...
cd /d "%~dp0"

if exist "dist\markdown-to-pdf-win32-x64\markdown-to-pdf.exe" (
    start "" "dist\markdown-to-pdf-win32-x64\markdown-to-pdf.exe"
) else if exist "node_modules" (
    echo Executable not found. Running in development mode...
    npm start
) else (
    echo Installing dependencies...
    call npm install
    echo.
    echo Building executable...
    call npm run package-win
    echo.
    echo Starting application...
    start "" "dist\markdown-to-pdf-win32-x64\markdown-to-pdf.exe"
)