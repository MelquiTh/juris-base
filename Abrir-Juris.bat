@echo off
setlocal
cd /d "%~dp0"

if exist "%~dp0node_modules\.bin\electron.cmd" (
  start "Juris" "%~dp0node_modules\.bin\electron.cmd" "%~dp0"
  exit /b 0
)

set "APP_URL=file:///%~dp0index.html"

where msedge.exe >nul 2>nul
if %errorlevel%==0 (
  start "Juris" msedge.exe --app="%APP_URL%" --start-maximized
  exit /b 0
)

where chrome.exe >nul 2>nul
if %errorlevel%==0 (
  start "Juris" chrome.exe --app="%APP_URL%" --start-maximized
  exit /b 0
)

start "" "%~dp0index.html"
endlocal
