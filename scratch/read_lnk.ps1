$g = New-Object -ComObject WScript.Shell
Get-ChildItem -Path "C:\Users\Luis Brun\Desktop" -Filter "*.lnk" | ForEach-Object {
    $s = $g.CreateShortcut($_.FullName)
    [PSCustomObject]@{
        Name = $_.Name
        Target = $s.TargetPath
        Arguments = $s.Arguments
        WorkingDir = $s.WorkingDirectory
    }
} | Format-List
