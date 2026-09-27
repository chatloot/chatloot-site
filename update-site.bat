@echo off
setlocal

echo ==========================================
echo   ChatLoot site - update and deploy
echo ==========================================
echo.

set /p COMMITMSG="Describe this update (or press Enter for default): "

if "%COMMITMSG%"=="" (
    set COMMITMSG=Update products - %date% %time%
)

echo.
echo Staging changes...
git add .

echo Committing: %COMMITMSG%
git commit -m "%COMMITMSG%"

if errorlevel 1 (
    echo.
    echo Nothing to commit, or commit failed - check the message above.
    echo Skipping push.
    goto end
)

echo Pushing to GitHub...
git push

if errorlevel 1 (
    echo.
    echo Push failed - check the error above ^(e.g. network issue,
    echo authentication prompt, or needing to "git pull" first^).
    goto end
)

echo.
echo Done! Netlify will rebuild automatically - usually live within
echo a minute or two. Check the Deploys tab if you want to watch it.

:end
echo.
pause
