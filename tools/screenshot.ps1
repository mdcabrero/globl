$ErrorActionPreference = 'Stop'

# Locate Chrome
$chromePaths = @(
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
)

$chrome = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) {
  Write-Error 'Google Chrome not found. Please install Chrome or adjust the path.'
}

# Resolve paths
$index = Resolve-Path -LiteralPath './index.html'
$outDir = Resolve-Path -LiteralPath './dist'
$outFile = Join-Path $outDir.Path 'index-snapshot.png'

# Build file URL
$url = 'file:///' + $index.Path.Replace('\\','/')

# Run headless Chrome to capture screenshot
& $chrome `
  '--headless=new' `
  '--disable-gpu' `
  '--window-size=1440,900' `
  ("--screenshot=$outFile") `
  '--virtual-time-budget=6000' `
  $url | Out-Null

if (Test-Path $outFile) {
  Write-Output $outFile
} else {
  Write-Error "Failed to create screenshot at: $outFile"
}

