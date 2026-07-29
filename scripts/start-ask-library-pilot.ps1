$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$privateRoot = Join-Path $repoRoot "pilot-data\ask-library\private"

foreach ($folder in @("requests", "briefs", "audits", "feedback")) {
    New-Item -ItemType Directory -Force -Path (Join-Path $privateRoot $folder) | Out-Null
}

$bridgeCommand = "C:\Users\eric_rash\Desktop\DEV\ZoteroInjestion\.venv\Scripts\zotero-bridge.exe"
if (Test-Path -LiteralPath $bridgeCommand) {
    $env:ZOTERO_BRIDGE_COMMAND = $bridgeCommand
}

Set-Location -LiteralPath $repoRoot

Write-Host ""
Write-Host "ASK THE LIBRARY PILOT" -ForegroundColor Green
Write-Host "1. Staff enters one de-identified question."
Write-Host "2. Select 'Save question for Codex.'"
Write-Host "3. Give the downloaded ATL-R JSON file to Codex."
Write-Host "4. Return here and choose Codex's finished answer file."
Write-Host ""
Write-Host "Leave this window open. The prototype will open in your browser." -ForegroundColor Yellow
Write-Host ""

npm run prototype
