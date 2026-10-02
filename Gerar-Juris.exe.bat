@echo off
setlocal
cd /d "%~dp0"

where node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado.
  echo Instale a versao LTS em https://nodejs.org/ e execute este arquivo novamente.
  pause
  exit /b 1
)

echo Instalando dependencias do Juris...
call npm install
if errorlevel 1 (
  echo Nao foi possivel instalar as dependencias.
  pause
  exit /b 1
)

echo Gerando versao portatil do Juris...
call npm run dist
if errorlevel 1 (
  echo A compilacao falhou.
  pause
  exit /b 1
)

echo.
echo Pronto. O arquivo Juris-1.0.0.exe esta na pasta dist.
pause
endlocal