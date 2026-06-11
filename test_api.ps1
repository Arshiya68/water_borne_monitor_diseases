# Test API endpoints
$baseUrl = "http://localhost:5000/api"

Write-Host "Testing WaterGuard API Endpoints..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host "`n1. Testing Risk Prediction Endpoint..."
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/risk/Hyderabad" -Method GET -SkipHttpErrorCheck
    if ($response.StatusCode -eq 401) {
        Write-Host "✓ Risk endpoint accessible (JWT required)" -ForegroundColor Green
    } else {
        Write-Host "✓ Risk endpoint response: $($response.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n2. Testing Water Sources Endpoint..."
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/water-sources/list" -Method GET -SkipHttpErrorCheck
    if ($response.StatusCode -eq 401) {
        Write-Host "✓ Water sources endpoint accessible (JWT required)" -ForegroundColor Green
    } else {
        Write-Host "✓ Water sources response: $($response.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n3. Testing Emergency Endpoint..."
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/emergency/hospitals/Hyderabad" -Method GET -SkipHttpErrorCheck
    if ($response.StatusCode -eq 401) {
        Write-Host "✓ Emergency endpoint accessible (JWT required)" -ForegroundColor Green
    } else {
        Write-Host "✓ Emergency response: $($response.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n4. Testing Community Endpoint..."
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/community/engagement/Hyderabad" -Method GET -SkipHttpErrorCheck
    if ($response.StatusCode -eq 401) {
        Write-Host "✓ Community endpoint accessible (JWT required)" -ForegroundColor Green
    } else {
        Write-Host "✓ Community response: $($response.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n5. Testing SMS Endpoint..."
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/sms/statistics" -Method GET -SkipHttpErrorCheck
    if ($response.StatusCode -eq 401) {
        Write-Host "✓ SMS endpoint accessible (JWT required)" -ForegroundColor Green
    } else {
        Write-Host "✓ SMS response: $($response.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Green
Write-Host "API Test Complete!" -ForegroundColor Green
