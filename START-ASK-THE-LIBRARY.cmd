@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-ask-library-pilot.ps1"
if errorlevel 1 (
  echo.
  echo Ask the Library did not start. Take a screenshot of this window and send it to the pilot lead.
  pause
)
endlocal
