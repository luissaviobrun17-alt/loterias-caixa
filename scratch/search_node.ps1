$paths = @(
    "C:\Program Files",
    "C:\Program Files (x86)",
    "C:\Users\Luis Brun\AppData"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "Searching in $p..."
        Get-ChildItem -Path $p -Filter "node.exe" -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "FOUND: $($_.FullName)"
        }
    }
}
Write-Host "Search finished."
