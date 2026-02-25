param(
  [string]$CssFile = "style.css"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$cssPath = Join-Path $projectRoot $CssFile

if (-not (Test-Path $cssPath)) {
  throw "CSS file not found: $cssPath"
}

$hash = (Get-FileHash -Path $cssPath -Algorithm SHA256).Hash.ToLower()
$version = $hash.Substring(0, 12)

$htmlFiles = Get-ChildItem -Path $projectRoot -Filter "*.html" -File -Recurse
$pattern = 'href="style\.css(?:\?v=[^"]*)?"'
$replacement = 'href="style.css?v=' + $version + '"'

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$changedCount = 0

foreach ($file in $htmlFiles) {
  $original = [System.IO.File]::ReadAllText($file.FullName)
  $updated = [System.Text.RegularExpressions.Regex]::Replace($original, $pattern, $replacement)

  if ($updated -ne $original) {
    [System.IO.File]::WriteAllText($file.FullName, $updated, $utf8NoBom)
    $changedCount++
    Write-Host "Updated: $($file.Name)"
  }
}

Write-Host ""
Write-Host "Cache-buster version: $version"
Write-Host "Updated files: $changedCount"
