#!/usr/bin/env pwsh
# =============================================================
#  deploy.ps1  —  Commit y deploy a Vercel
#  Ejecuta esto en tu PowerShell normal (donde tienes Git):
#    cd "C:\Users\javii\Documents\antigravity\keen-goodall"
#    .\deploy.ps1
# =============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY: Protagonistas del Cambio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Ejecuta este script desde la raiz del proyecto." -ForegroundColor Red
    exit 1
}

# Agregar todos los cambios
Write-Host "📁 Agregando cambios..." -ForegroundColor Yellow
git add .

# Ver qué cambió
Write-Host ""
Write-Host "📋 Archivos modificados:" -ForegroundColor Yellow
git status --short

Write-Host ""

# Commit
$msg = "feat: formulario con enlace Drive + subida de archivos adjuntos"
git commit -m $msg
Write-Host "✅ Commit: $msg" -ForegroundColor Green

# Push → Vercel auto-deploya al recibir el push
Write-Host ""
Write-Host "🚀 Enviando a GitHub (Vercel deployará automáticamente)..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ¡LISTO! El deploy comenzará en Vercel" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "👉 Revisa el progreso en:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
