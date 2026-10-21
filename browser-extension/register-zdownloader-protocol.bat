@echo off
echo ============================================================
echo   Z Downloader - Cyberpunk Protocol & Extension Setup
echo ============================================================
echo.

set "APP_EXE=%LOCALAPPDATA%\Z Downloader\z-downloader.exe"

if not exist "%APP_EXE%" (
    echo [NOTICE] Standard installed location:
    echo   "%APP_EXE%"
    echo If you have a custom or portable build, please enter the path below.
    set /p APP_EXE="Enter full path to z-downloader.exe (or press Enter if in default path): "
)

if "%APP_EXE%"=="" set "APP_EXE=%LOCALAPPDATA%\Z Downloader\z-downloader.exe"

echo Registering Windows Protocols: zdownloader:// and zdl:// ...

reg add "HKCU\Software\Classes\zdownloader" /ve /d "URL:Z Downloader Protocol" /f >nul
reg add "HKCU\Software\Classes\zdownloader" /v "URL Protocol" /d "" /f >nul
reg add "HKCU\Software\Classes\zdownloader\shell\open\command" /ve /d "\"%APP_EXE%\" \"%%1\"" /f >nul

reg add "HKCU\Software\Classes\zdl" /ve /d "URL:ZDL Protocol" /f >nul
reg add "HKCU\Software\Classes\zdl" /v "URL Protocol" /d "" /f >nul
reg add "HKCU\Software\Classes\zdl\shell\open\command" /ve /d "\"%APP_EXE%\" \"%%1\"" /f >nul

reg add "HKCU\Software\Classes\parrot" /ve /d "URL:Parrot Protocol" /f >nul
reg add "HKCU\Software\Classes\parrot" /v "URL Protocol" /d "" /f >nul
reg add "HKCU\Software\Classes\parrot\shell\open\command" /ve /d "\"%APP_EXE%\" \"%%1\"" /f >nul

reg add "HKCU\Software\Classes\gmdownloader" /ve /d "URL:GM Downloader Protocol" /f >nul
reg add "HKCU\Software\Classes\gmdownloader" /v "URL Protocol" /d "" /f >nul
reg add "HKCU\Software\Classes\gmdownloader\shell\open\command" /ve /d "\"%APP_EXE%\" \"%%1\"" /f >nul

echo [SUCCESS] Protocols registered successfully!
echo Executable: "%APP_EXE%"

echo.
echo ============================================================
echo   Chrome / Edge / Brave Extension Installation:
echo ============================================================
echo 1. Open Google Chrome, Brave, or Microsoft Edge.
echo 2. Go to: chrome://extensions or brave://extensions or edge://extensions
echo 3. Enable 'Developer mode' (toggle switch in top-right).
echo 4. Click 'Load unpacked'.
echo 5. Select this folder:
echo    %~dp0
echo.
echo IDM-style automatic download interception is now ready!
echo ============================================================
pause
