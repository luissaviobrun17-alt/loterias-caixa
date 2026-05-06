' =====================================================
' B2B Loterias — Iniciar Servidor Automaticamente
' Este script inicia o server.js em background
' Colocar na pasta Startup do Windows para auto-inicio
' =====================================================

Dim objShell, objFSO
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Caminho do servidor
Dim caminhoApp, caminhoServer, caminhoNode
caminhoApp = objFSO.GetParentFolderName(WScript.ScriptFullName)
caminhoServer = caminhoApp & "\server.js"
caminhoNode = """C:\Program Files\nodejs\node.exe"""

' Verificar se o servidor ja esta rodando
Dim xmlHttp, serverRunning
serverRunning = False
On Error Resume Next
Set xmlHttp = CreateObject("MSXML2.ServerXMLHTTP.6.0")
xmlHttp.setTimeouts 2000, 2000, 2000, 2000
xmlHttp.Open "GET", "http://localhost:8777/", False
xmlHttp.Send
If Err.Number = 0 And xmlHttp.status = 200 Then
    serverRunning = True
End If
Set xmlHttp = Nothing
Err.Clear
On Error GoTo 0

' Se nao esta rodando, iniciar
If Not serverRunning Then
    If objFSO.FileExists(caminhoServer) Then
        ' Iniciar servidor em background (invisivel, sem janela)
        objShell.Run caminhoNode & " """ & caminhoServer & """", 0, False
        
        ' Aguardar servidor ficar pronto (ate 10 segundos)
        Dim tentativa, serverOK
        serverOK = False
        For tentativa = 1 To 7
            WScript.Sleep 1500
            On Error Resume Next
            Set xmlHttp = CreateObject("MSXML2.ServerXMLHTTP.6.0")
            xmlHttp.setTimeouts 1500, 1500, 1500, 1500
            xmlHttp.Open "GET", "http://localhost:8777/", False
            xmlHttp.Send
            If Err.Number = 0 And xmlHttp.status = 200 Then
                serverOK = True
            End If
            Set xmlHttp = Nothing
            Err.Clear
            On Error GoTo 0
            If serverOK Then Exit For
        Next
    End If
End If

Set objShell = Nothing
Set objFSO = Nothing
