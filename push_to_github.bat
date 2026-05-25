@echo off
title Push Update to GitHub - By M-Click
color 0B
echo ===================================================
echo        ⚡ BY M-CLICK GITHUB AUTO-PUSH ⚡
echo ===================================================
echo.

:: Step 1: Check git status
echo [1/4] Memeriksa status berkas...
git status -s
echo.

:: Step 2: Stage all changes
echo [2/4] Menambahkan perubahan ke Git...
git add .
echo.

:: Step 3: Prompt for commit message
set "msg="
set /p msg="Masukkan pesan perubahan (atau tekan Enter untuk memakai default: 'Update By M-Click'): "
if "%msg%"=="" (
    set msg="Update By M-Click"
)

echo.
echo [3/4] Melakukan commit berkas...
git commit -m "%msg%"
echo.

:: Step 4: Push to GitHub
echo [4/4] Mengunggah ke GitHub (branch: main)...
git push -u origin main
echo.

echo ===================================================
echo  🎉 Selesai! Kode Anda berhasil diunggah ke GitHub!
echo ===================================================
echo.
pause
