// ═══════════════════════════════════════════════════════════
// TESTE RÁPIDO — 3 jogos de Mega-Sena no site da Caixa
// Cole este script no Console (F12) do site da Caixa
// Página: https://www.loteriasonline.caixa.gov.br/silce-web/#/mega-sena
// ═══════════════════════════════════════════════════════════
(async function(){
    var JOGOS = [[3,17,25,33,45,58],[7,12,19,28,39,52],[1,14,22,36,48,55]];
    var TOTAL = JOGOS.length;
    var OK = 0;
    var ERROS = 0;
    
    console.clear();
    console.log("B2B v5.0 TESTE — " + TOTAL + " jogos de Mega-Sena");
    
    var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
    
    function fecharModais() {
        var ids = ["fecharModalAlerta", "fecharModalErro", "fecharModalInfo", "confirmarModalConfirmacao"];
        for (var k = 0; k < ids.length; k++) {
            var el = document.getElementById(ids[k]);
            if (el && el.offsetParent !== null) {
                try { el.click(); console.log("Fechou: " + ids[k]); } catch(e) {}
            }
        }
        var bts = document.querySelectorAll("button");
        for (var j = 0; j < bts.length; j++) {
            var t = bts[j].textContent.trim().toLowerCase();
            if ((t === "ok" || t === "entendi" || t === "fechar") && bts[j].offsetParent !== null && bts[j].offsetWidth > 0) {
                try { bts[j].click(); } catch(e) {}
            }
        }
    }
    
    function clicarNumero(num) {
        var p = String(num).padStart(2, "0");
        var el = document.getElementById("n" + p);
        if (el) { el.click(); return true; }
        console.warn("Num " + p + " nao achado");
        return false;
    }
    
    function limpar() {
        fecharModais();
        var btn = document.getElementById("limparvolante");
        if (btn) { btn.click(); return true; }
        return false;
    }
    
    async function carrinho() {
        fecharModais();
        await delay(300);
        for (var t = 0; t < 5; t++) {
            var btn = document.getElementById("colocarnocarrinho");
            if (btn) {
                btn.click();
                await delay(1500);
                fecharModais();
                await delay(500);
                fecharModais();
                return true;
            }
            console.warn("carrinho tent " + (t + 1));
            await delay(1000);
            fecharModais();
        }
        return false;
    }
    
    // ═══ PROCESSAR JOGOS ═══
    for (var i = 0; i < TOTAL; i++) {
        var jogo = JOGOS[i];
        console.log("═══ Jogo " + (i + 1) + "/" + TOTAL + " [" + jogo.join(",") + "] ═══");
        fecharModais();
        
        if (i > 0) {
            limpar();
            await delay(2000);
            fecharModais();
            await delay(500);
        }
        
        var ac = 0;
        for (var n = 0; n < jogo.length; n++) {
            if (clicarNumero(jogo[n])) ac++;
            await delay(250);
        }
        
        if (ac < jogo.length) console.warn("Jogo " + (i + 1) + ": " + ac + "/" + jogo.length);
        
        await delay(1000);
        var ok = await carrinho();
        
        if (ok) {
            OK++;
            console.log("✅ OK " + (i + 1) + " (" + OK + "/" + TOTAL + ")");
        } else {
            ERROS++;
            console.error("❌ FAIL " + (i + 1));
        }
        
        if (i < TOTAL - 1) {
            await delay(3000);
            fecharModais();
        }
    }
    
    console.log("═══ PRONTO! " + OK + "/" + TOTAL + " jogos no carrinho! ═══");
    alert(OK + "/" + TOTAL + " jogos de Mega-Sena no carrinho!\nFinalize o pagamento.");
})();
