$ErrorActionPreference = 'Stop'
$previewUrl = 'http://127.0.0.1:4173'
$previewRoot = $PSScriptRoot
$previewLogs = Join-Path $previewRoot '.preview'
try {
    $response = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200 -and $response.Content -match 'id="graph"') {
        Write-Output "Previsualización disponible: $previewUrl"
        exit 0
    }
    throw 'El puerto 4173 está ocupado por otra aplicación.'
} catch {
    if ($_.Exception.Message -eq 'El puerto 4173 está ocupado por otra aplicación.') { throw }
}
New-Item -ItemType Directory -Path $previewLogs -Force | Out-Null
$previewNode = (Get-Command node -ErrorAction Stop).Source
$previewServer = Join-Path $previewRoot 'server.mjs'
$previewProcess = Start-Process -FilePath $previewNode -ArgumentList ('"' + $previewServer + '"') -WorkingDirectory $previewRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $previewLogs 'stdout.log') -RedirectStandardError (Join-Path $previewLogs 'stderr.log')
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    $previewProcess.Refresh()
    if ($previewProcess.HasExited) {
        throw "No se pudo iniciar la vista previa. Consulta $previewLogs\stderr.log"
    }
    try {
        $response = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 1
        if ($response.StatusCode -eq 200 -and $response.Content -match 'id="graph"') {
            Write-Output "Previsualización disponible: $previewUrl"
            exit 0
        }
    } catch { }
}
throw "La vista previa no responde. Consulta los registros en $previewLogs"
