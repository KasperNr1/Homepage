[CmdletBinding()]
param(
    [string]$Repository = "https://github.com/KasperNr1/Volcano.git",
    [string]$Branch = "main"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

& node (Join-Path $PSScriptRoot "refresh-notes.mjs") --repository $Repository --branch $Branch
$nodeExitCode = $LASTEXITCODE

if ($nodeExitCode -ne 0) {
    exit $nodeExitCode
}
