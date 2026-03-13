' =====================================================
' Script de Acesso Protegido - Loterias da Caixa
' Senha necessária para abrir o aplicativo
' =====================================================

Dim senha, tentativas, maxTentativas
maxTentativas = 3
tentativas = 0

Do
    tentativas = tentativas + 1
    senha = InputBox("🔒 ACESSO PROTEGIDO" & vbCrLf & vbCrLf & _
        "Digite a senha para acessar o" & vbCrLf & _
        "Gerador de Apostas - Loterias da Caixa" & vbCrLf & vbCrLf & _
        "Tentativa " & tentativas & " de " & maxTentativas, _
        "Loterias da Caixa - Autenticação")

    ' Usuário clicou Cancelar
    If IsEmpty(senha) Then
        WScript.Quit
    End If

    If senha = "130767" Then
        ' Senha correta - abrir o Chrome com o aplicativo
        Dim objShell
        Set objShell = CreateObject("WScript.Shell")
        
        ' Caminho do arquivo index.html
        Dim caminhoApp
        caminhoApp = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\index.html"
        
        ' Tenta abrir com o Chrome
        On Error Resume Next
        objShell.Run """C:\Program Files\Google\Chrome\Application\chrome.exe"" --app=""file:///" & Replace(caminhoApp, "\", "/") & """", 1, False
        
        If Err.Number <> 0 Then
            ' Se o Chrome não for encontrado no caminho padrão, tenta o caminho alternativo
            Err.Clear
            objShell.Run """C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"" --app=""file:///" & Replace(caminhoApp, "\", "/") & """", 1, False
            
            If Err.Number <> 0 Then
                ' Se ainda não encontrou, abre com o navegador padrão
                Err.Clear
                objShell.Run caminhoApp, 1, False
            End If
        End If
        On Error GoTo 0
        
        Set objShell = Nothing
        WScript.Quit
    Else
        If tentativas < maxTentativas Then
            MsgBox "❌ Senha incorreta!" & vbCrLf & vbCrLf & _
                "Você tem " & (maxTentativas - tentativas) & " tentativa(s) restante(s).", _
                vbExclamation, "Acesso Negado"
        Else
            MsgBox "🚫 Número máximo de tentativas excedido!" & vbCrLf & vbCrLf & _
                "O acesso foi bloqueado.", _
                vbCritical, "Acesso Bloqueado"
            WScript.Quit
        End If
    End If
Loop
