@echo off
REM Startet den Entwicklungsserver auch wenn npm nicht im PATH ist
set "NPM=C:\Program Files\nodejs\npm.cmd"
if not exist "%NPM%" set "NPM=%APPDATA%\npm\npm.cmd"

echo Beende ggf. alten Prozess auf Port 3000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a 2>nul
  timeout /t 1 /nobreak >nul
)
echo.

echo Installiere Abhaengigkeiten (falls noetig)...
call "%NPM%" install
echo.
echo Starte Server auf http://localhost:3000 ...
echo.
call "%NPM%" run dev
pause
