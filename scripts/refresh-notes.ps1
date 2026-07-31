[CmdletBinding()]
param(
    [string]$Repository = "https://github.com/KasperNr1/Volcano.git",
    [string]$Branch = "main"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$refPath = Join-Path $workspaceRoot "notes\volcano.ref"
$remoteRef = "refs/heads/$Branch"
$remoteResult = @(& git ls-remote $Repository $remoteRef 2>&1)

if ($LASTEXITCODE -ne 0) {
    throw "Could not read $remoteRef from $Repository.`n$($remoteResult -join [Environment]::NewLine)"
}

$latestCommit = (($remoteResult | Select-Object -First 1) -split "\s+")[0]
if ($latestCommit -notmatch "^[0-9a-f]{40}$") {
    throw "Git returned an invalid commit for ${remoteRef}: $latestCommit"
}

$currentCommit = (Get-Content $refPath -Raw).Trim()
if ($currentCommit -eq $latestCommit) {
    Write-Output "Notes snapshot is already current at $latestCommit."
    return
}

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($refPath, "$latestCommit`n", $utf8WithoutBom)

Write-Output "Updated notes snapshot:"
Write-Output "  $currentCommit"
Write-Output "  $latestCommit"
Write-Output "Commit notes/volcano.ref and redeploy the homepage to publish it."