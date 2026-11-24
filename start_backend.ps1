Set-Location "$PSScriptRoot\backend"
Write-Host "Starting V3RA Admission Hub Backend on http://localhost:8000 ..." -ForegroundColor Cyan
uvicorn main:app --reload --host 0.0.0.0 --port 8000
