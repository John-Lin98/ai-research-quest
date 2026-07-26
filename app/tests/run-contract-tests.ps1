$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\\..")
Push-Location $root
try {
  npx --no-install tsx app/tests/contract.spec.ts
  npx --no-install tsx app/tests/security-contract.spec.ts
  node app/tests/validate-fixtures.mjs
  node skills/research-quest/scripts/generate-test-sessions.mjs --check-only
  Write-Output "CONTRACT_SUITE_OK"
}
finally {
  Pop-Location
}
