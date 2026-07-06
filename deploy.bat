@echo off
rem Deploys the game to Azure Static Web Apps.
rem Expects a StaticSites folder next to this repo (..\StaticSites) containing
rem the shared SWA deploy script and the source folder for the sites.
rem 1. Runs the test suite (aborts on failure)
rem 2. Mirrors webfiles\ into the StaticSites source folder
rem 3. Runs the shared SWA deploy script
setlocal

set TARGET=%~dp0..\StaticSites\source\stugan
set DEPLOY=%~dp0..\StaticSites\deploy_staticweb.bat

pushd "%~dp0"

echo === Running tests ===
call npm test
if errorlevel 1 (
    echo Tests failed - deploy aborted.
    popd
    exit /b 1
)

echo === Copying webfiles to %TARGET% ===
robocopy "%~dp0webfiles" "%TARGET%" /MIR /NFL /NDL /NJH /NJS
if errorlevel 8 (
    echo Copy failed - deploy aborted.
    popd
    exit /b 1
)

echo === Deploying to Azure Static Web Apps ===
call "%DEPLOY%"

popd
endlocal
