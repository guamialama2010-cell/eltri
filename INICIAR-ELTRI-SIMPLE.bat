@echo off
cls

echo.
echo ELTRI - Iniciando...
echo.

REM Limpiar puerto 3000
echo Limpiando puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Limpiar puerto 5173
echo Limpiando puerto 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Puertos limpios
echo.

REM Abrir backend
echo Iniciando Backend...
start "Backend" cmd /k "cd /d C:\Users\guami\Documents\eltri\server && npm run dev"

REM Esperar
timeout /t 5 /nobreak

REM Abrir frontend
echo Iniciando Frontend...
start "Frontend" cmd /k "cd /d C:\Users\guami\Documents\eltri\client && npm run dev"

REM Esperar
timeout /t 5 /nobreak

REM Abrir navegador
echo Abriendo navegador...
timeout /t 2 /nobreak
start http://localhost:5173/login

echo.
echo ELTRI esta iniciando
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173/login
echo.
pause
