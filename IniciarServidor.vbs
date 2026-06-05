' =====================================================================
' B2B Loterias — Servidor Silencioso v6.0
' Startup do Windows — 100% invisivel, sem pop-ups
' =====================================================================
Option Explicit

Dim sh, fso
Set sh  = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Const APP_DIR = "C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa"
Const PORTA   = 8777

' Testar se ja esta rodando
Dim h, rodando : rodando = False
On Error Resume Next
Set h = CreateObject("MSXML2.ServerXMLHTTP.6.0")
h.setTimeouts 2000, 2000, 2000, 2000
h.Open "GET", "http://localhost:" & PORTA & "/", False
h.Send
If Err.Number = 0 And h.Status >= 200 And h.Status < 400 Then rodando = True
Set h = Nothing : Err.Clear
On Error GoTo 0

If rodando Then WScript.Quit

' Localizar node.exe
Dim nd : nd = ""
Dim caminhos : caminhos = Array( _
    "C:\Program Files\nodejs\node.exe", _
    sh.ExpandEnvironmentStrings("%LOCALAPPDATA%\Programs\nodejs\node.exe"))
Dim p
For Each p In caminhos
    If fso.FileExists(p) Then
        nd = """" & p & """"
        Exit For
    End If
Next
If nd = "" Then nd = "node.exe"

' Iniciar servidor
Dim sj : sj = APP_DIR & "\server.js"
If fso.FileExists(sj) Then
    sh.Run nd & " """ & sj & """", 0, False
End If

WScript.Quit
