$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "Building JARs locally with Maven..."
$mvnArgs = @("-q", "clean", "package", "-DskipTests")

Push-Location documents-service
mvn @mvnArgs
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
Pop-Location

Push-Location comments-service
mvn @mvnArgs
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
Pop-Location

Push-Location gateway-service
mvn @mvnArgs
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
Pop-Location

Write-Host "Starting stack with pre-built JARs (no Maven inside Docker)..."
docker compose -f docker-compose.yml -f docker-compose.prebuilt.yml up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. Gateway: http://localhost:8085"
    docker compose ps
} else {
    Write-Host "docker compose failed. If you still see 'read-only file system', restart Docker Desktop and run: docker system prune -a"
    exit $LASTEXITCODE
}
