' =====================================================
' Script de Acesso - B2B Loterias
' Protecao: Licenca por maquina + Senha
' =====================================================
' MAQUINA MESTRE: LUISB2B (sempre liberada)
' CLIENTES: Precisam de licenca.key valida
' =====================================================

Dim objShell, objFSO
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

Dim computerName, liberado
computerName = objShell.ExpandEnvironmentStrings("%COMPUTERNAME%")
liberado = False

' Maquina mestre (proprietario) - sempre liberada
If UCase(computerName) = "LUISB2B" Then
    liberado = True
End If

' Se nao e maquina mestre, verificar licenca
If Not liberado Then
    Dim licensePath
    licensePath = objFSO.GetParentFolderName(WScript.ScriptFullName) & "\licenca.key"

    If Not objFSO.FileExists(licensePath) Then
        MsgBox "LICENCA NAO ENCONTRADA!" & vbCrLf & vbCrLf & _
            "Este programa requer uma licenca valida." & vbCrLf & vbCrLf & _
            "Sua maquina: " & computerName & vbCrLf & vbCrLf & _
            "Para adquirir sua licenca:" & vbCrLf & _
            "Entre em contato com o vendedor e" & vbCrLf & _
            "informe o nome da sua maquina acima.", _
            vbCritical, "B2B Loterias - Licenca Necessaria"
        WScript.Quit
    End If

    Dim objFile, licenseContent, lines, line
    Dim storedComputer
    storedComputer = ""

    Set objFile = objFSO.OpenTextFile(licensePath, 1)
    licenseContent = objFile.ReadAll
    objFile.Close

    lines = Split(licenseContent, vbNewLine)
    For Each line In lines
        If Left(line, 11) = "Computador=" Then
            storedComputer = Trim(Mid(line, 12))
        End If
    Next

    If UCase(storedComputer) = UCase(computerName) Then
        liberado = True
    Else
        MsgBox "LICENCA INVALIDA PARA ESTA MAQUINA!" & vbCrLf & vbCrLf & _
            "A licenca e para: " & storedComputer & vbCrLf & _
            "Esta maquina e: " & computerName & vbCrLf & vbCrLf & _
            "A reproducao ou venda por terceiros" & vbCrLf & _
            "e PROIBIDA e viola os termos de uso." & vbCrLf & vbCrLf & _
            "Cada licenca funciona em APENAS UMA maquina.", _
            vbCritical, "B2B Loterias - Acesso Bloqueado"
        WScript.Quit
    End If
End If

' ============= LICENCA OK - PEDIR SENHA =============
If liberado Then
    Dim senha, tentativas, maxTentativas
    maxTentativas = 3
    tentativas = 0

    Do
        tentativas = tentativas + 1
        
        Dim msgLicenca
        If UCase(computerName) = "LUISB2B" Then
            msgLicenca = "MAQUINA MESTRE (Proprietario)"
        Else
            msgLicenca = "Licenca valida para: " & computerName
        End If
        
        senha = InputBox("ACESSO PROTEGIDO" & vbCrLf & vbCrLf & _
            msgLicenca & vbCrLf & vbCrLf & _
            "Digite a senha para acessar o" & vbCrLf & _
            "B2B Loterias - Gerador de Apostas" & vbCrLf & vbCrLf & _
            "Tentativa " & tentativas & " de " & maxTentativas, _
            "B2B Loterias - Autenticacao")

        If IsEmpty(senha) Then
            WScript.Quit
        End If

        If senha = "130767" Then
            Dim caminhoApp
            caminhoApp = objFSO.GetParentFolderName(WScript.ScriptFullName) & "\index.html"
            
            On Error Resume Next
            objShell.Run """C:\Program Files\Google\Chrome\Application\chrome.exe"" --app=""file:///" & Replace(caminhoApp, "\", "/") & """", 1, False
            
            If Err.Number <> 0 Then
                Err.Clear
                objShell.Run """C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"" --app=""file:///" & Replace(caminhoApp, "\", "/") & """", 1, False
                
                If Err.Number <> 0 Then
                    Err.Clear
                    objShell.Run caminhoApp, 1, False
                End If
            End If
            On Error GoTo 0
            
            Set objShell = Nothing
            WScript.Quit
        Else
            If tentativas < maxTentativas Then
                MsgBox "Senha incorreta!" & vbCrLf & vbCrLf & _
                    "Voce tem " & (maxTentativas - tentativas) & " tentativa(s) restante(s).", _
                    vbExclamation, "Acesso Negado"
            Else
                MsgBox "Numero maximo de tentativas excedido!" & vbCrLf & vbCrLf & _
                    "O acesso foi bloqueado.", _
                    vbCritical, "Acesso Bloqueado"
                WScript.Quit
            End If
        End If
    Loop
End If
