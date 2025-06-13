@echo off
echo.
echo ===================================
echo   FilmSage Documentation Generator
echo ===================================
echo.
echo Generating JSDoc documentation...
call npm run docs
echo.
echo Documentation generated successfully!
echo Opening documentation in browser...
echo.
call npm run docs:serve 