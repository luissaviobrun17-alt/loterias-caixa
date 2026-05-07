' =====================================================================
' B2B Loterias — Launcher Ultra-Leve v6.1
' Senha + Servidor + Chrome — sequencia garantida
' =====================================================================
Option Explicit

Dim sh, fso
Set sh  = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Const APP_DIR = "C:\Users\luiss\Desktop\B2B_Loterias"
Const PORTA   = 8777
Const SENHA   = "130767"

' ── 1. VERIFICAR LICENCA ──
Dim pc
pc = UCase(sh.ExpandEnvironmentStrings("%COMPUTERNAME%"))

If pc <> "LUISB2B" Then
    Dim lp
    lp = APP_DIR & "\licenca.key"
    If Not fso.FileExists(lp) Then
        MsgBox "LICENCA NAO ENCONTRADA!" & vbCrLf & vbCrLf & "Maquina: " & pc, vbCritical, "B2B Loterias"
        WScript.Quit
    End If
    Dim f, txt, arr, ln, comp
    comp = ""
    Set f = fso.OpenTextFile(lp, 1)
    txt = f.ReadAll
    f.Close
    arr = Split(txt, vbNewLine)
    For Each ln In arr
        If Left(ln, 11) = "Computador=" Then comp = Trim(Mid(ln, 12))
    Next
    If UCase(comp) <> pc Then
        MsgBox "Licenca invalida!" & vbCrLf & "Licenca: " & comp & vbCrLf & "Maquina: " & pc, vbCritical, "B2B Loterias"
        WScript.Quit
    End If
End If

' ── 2. PEDIR SENHA (3 tentativas) ──
Dim senhaCorreta, tent, s
senhaCorreta = False

For tent = 1 To 3
    s = InputBox("ACESSO PROTEGIDO" & vbCrLf & vbCrLf & _
        "Maquina: " & pc & vbCrLf & vbCrLf & _
        "Digite a senha:" & vbCrLf & _
        "Tentativa " & tent & " de 3", "B2B Loterias")
    If IsEmpty(s) Then WScript.Quit
    If s = SENHA Then
        senhaCorreta = True
        Exit For
    End If
    If tent < 3 Then MsgBox "Senha incorreta! Restam " & (3 - tent) & " tentativa(s).", vbExclamation, "B2B Loterias"
Next

If Not senhaCorreta Then
    MsgBox "Acesso bloqueado!", vbCritical, "B2B Loterias"
    WScript.Quit
End If

' ── 3. GARANTIR SERVIDOR RODANDO ──
If Not ServidorAtivo() Then
    Dim nd, sj
    nd = AcharNode()
    sj = APP_DIR & "\server.js"
    If nd <> "" And fso.FileExists(sj) Then
        sh.Run nd & " """ & sj & """", 0, False
        Dim w
        For w = 1 To 20
            WScript.Sleep 500
            If ServidorAtivo() Then Exit For
        Next
    End If
End If

' ── 4. DELAY DE SEGURANCA + ABRIR CHROME ──
WScript.Sleep 800

Dim cr
cr = AcharChrome()
On Error Resume Next
If cr <> "" Then
    sh.Run """" & cr & """ --app=""http://localhost:" & PORTA & "/""", 1, False
Else
    sh.Run "http://localhost:" & PORTA & "/", 1, False
End If
On Error GoTo 0

Set sh = Nothing
Set fso = Nothing
WScript.Quit

' ═══════════════════ FUNCOES ═══════════════════

Function ServidorAtivo()
    ServidorAtivo = False
    Dim h
    On Error Resume Next
    Set h = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    h.setTimeouts 2000, 2000, 2000, 2000
    h.Open "GET", "http://localhost:" & PORTA & "/", False
    h.Send
    If Err.Number = 0 Then
        If h.Status >= 200 And h.Status < 400 Then ServidorAtivo = True
    End If
    Set h = Nothing
    Err.Clear
    On Error GoTo 0
End Function

Function AcharNode()
    AcharNode = ""
    Dim caminhos, p
    caminhos = Array( _
        "C:\Program Files\nodejs\node.exe", _
        sh.ExpandEnvironmentStrings("%LOCALAPPDATA%\Programs\nodejs\node.exe"))
    For Each p In caminhos
        If fso.FileExists(p) Then
            AcharNode = """" & p & """"
            Exit Function
        End If
    Next
    AcharNode = "node.exe"
End Function

Function AcharChrome()
    AcharChrome = ""
    Dim caminhos, p
    caminhos = Array( _
        "C:\Program Files\Google\Chrome\Application\chrome.exe", _
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", _
        sh.ExpandEnvironmentStrings("%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"))
    For Each p In caminhos
        If fso.FileExists(p) Then
            AcharChrome = p
            Exit Function
        End If
    Next
End Function
