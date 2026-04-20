$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$deployRoot = Join-Path $repoRoot ".railway-deploy"

$rootFiles = @(
    "api.py",
    "prepare_search_data.py",
    "build_madrid_search_index.py",
    "requirements.txt",
    "railway.json"
)

$dataFiles = @(
    "data/processed/refugios_sustitutos.geojson",
    "data/processed/fuentes.geojson",
    "data/reference/madrid_search_curated.json"
)

$allFiles = @($rootFiles + $dataFiles)

foreach ($relativePath in $allFiles) {
    $sourcePath = Join-Path $repoRoot $relativePath
    if (-not (Test-Path $sourcePath -PathType Leaf)) {
        throw "Required deploy file is missing: $relativePath"
    }
}

if (Test-Path $deployRoot) {
    Remove-Item $deployRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $deployRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $deployRoot "data\processed") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $deployRoot "data\reference") -Force | Out-Null

foreach ($relativePath in $allFiles) {
    $sourcePath = Join-Path $repoRoot $relativePath
    $destinationPath = Join-Path $deployRoot $relativePath
    $destinationDir = Split-Path -Parent $destinationPath
    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    Copy-Item $sourcePath $destinationPath -Force
}

Write-Host "Generated .railway-deploy with these files:"
foreach ($relativePath in $allFiles) {
    Write-Host " - $relativePath"
}

railway up ".railway-deploy" --path-as-root
