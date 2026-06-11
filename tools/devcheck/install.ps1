# DevCheck - Instalacao Windows
# Execute com: .\install.ps1

$ErrorActionPreference = "Stop"

$scriptDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$devcheckPath = "D:\ferramentas\devcheck"
$profilePath  = $PROFILE
$mainPy       = "$devcheckPath\cli\main.py"

Write-Host ""
Write-Host "DevCheck - Instalacao" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor DarkGray

# 1. Copia os arquivos
Write-Host ""
Write-Host "[1/3] Copiando arquivos para $devcheckPath..." -ForegroundColor Yellow

if (-not (Test-Path $devcheckPath)) {
    New-Item -ItemType Directory -Path $devcheckPath -Force | Out-Null
}

Copy-Item -Path "$scriptDir\*" -Destination $devcheckPath -Recurse -Force
Write-Host "    Arquivos copiados." -ForegroundColor Green

# 2. Adiciona funcao ao perfil PowerShell
Write-Host "[2/3] Configurando alias no PowerShell..." -ForegroundColor Yellow

$line1 = "# DevCheck"
$line2 = "function devcheck { python `"$mainPy`" @args }"

if (-not (Test-Path $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
}

$profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
if ($null -eq $profileContent) { $profileContent = "" }

if ($profileContent -notlike "*DevCheck*") {
    Add-Content -Path $profilePath -Value ""
    Add-Content -Path $profilePath -Value $line1
    Add-Content -Path $profilePath -Value $line2
    Write-Host "    Adicionado ao perfil: $profilePath" -ForegroundColor Green
} else {
    Write-Host "    Alias ja existe no perfil." -ForegroundColor DarkGray
}

# 3. Verifica Python
Write-Host "[3/3] Verificando Python..." -ForegroundColor Yellow

$pyCheck = $null
try {
    $pyCheck = & python --version 2>&1
} catch {
    $pyCheck = $null
}

if ($null -eq $pyCheck -or $pyCheck -notlike "Python*") {
    Write-Host "    ERRO: Python nao encontrado. Instale em https://python.org" -ForegroundColor Red
    exit 1
}

Write-Host "    $pyCheck" -ForegroundColor Green

# Conclusao
Write-Host ""
Write-Host "-----------------------------" -ForegroundColor DarkGray
Write-Host "DevCheck instalado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Reinicie o PowerShell e teste:" -ForegroundColor Cyan
Write-Host "  devcheck health" -ForegroundColor White
Write-Host "  devcheck quick" -ForegroundColor White
Write-Host "  devcheck full" -ForegroundColor White
Write-Host "  devcheck approve" -ForegroundColor White
Write-Host "  devcheck dashboard" -ForegroundColor White
Write-Host ""
