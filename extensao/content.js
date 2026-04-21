// B2B Loterias - Content Script
// Roda automaticamente no site da Caixa Loterias
// Verifica se há jogos pendentes e executa a automação

(function() {
    'use strict';

    // Verificar se há jogos pendentes no URL (via query param ?b2b=...)
    function checkURLGames() {
        const url = new URL(window.location.href);
        const b2bData = url.searchParams.get('b2b');
        if (b2bData) {
            try {
                const decoded = JSON.parse(atob(b2bData));
                if (decoded && decoded.games && decoded.games.length > 0) {
                    // Limpar o param da URL sem recarregar
                    url.searchParams.delete('b2b');
                    history.replaceState(null, '', url.pathname + url.hash);
                    return decoded;
                }
            } catch(e) {
                console.log('[B2B] Erro ao decodificar dados da URL:', e);
            }
        }
        return null;
    }

    // Verificar se há jogos pendentes no chrome.storage
    function checkStorageGames() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['b2b_pending_games'], (result) => {
                    if (result.b2b_pending_games) {
                        // Limpar após ler
                        chrome.storage.local.remove(['b2b_pending_games']);
                        resolve(result.b2b_pending_games);
                    } else {
                        resolve(null);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    // ═══ MOTOR DE AUTOMAÇÃO v10.0 TURBO ═══
    async function executarAutomacao(data) {
        const games = data.games;
        const cfg = data.config || { name: 'Loteria' };
        const T = games.length;
        let OK = 0, ER = 0;
        const isTM = (cfg.url === 'timemania');
        const isDS = (cfg.url === 'dia-de-sorte');

        function d(ms) { return new Promise(r => setTimeout(r, ms)); }

        function rc(el) {
            if (!el) return false;
            try {
                el.scrollIntoView({ block: 'center', behavior: 'instant' });
                const r = el.getBoundingClientRect();
                const x = r.left + r.width / 2;
                const y = r.top + r.height / 2;
                ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(ev => {
                    el.dispatchEvent(new MouseEvent(ev, { view: window, bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 }));
                });
                return true;
            } catch(e) {
                try { el.click(); return true; } catch(e2) { return false; }
            }
        }

        function fm() {
            ['fecharModalAlerta','fecharModalErro','fecharModalInfo','confirmarModalConfirmacao','botaosim','btnFecharModal','btnOk','btnConfirmar'].forEach(id => {
                const el = document.getElementById(id);
                if (el && el.offsetParent !== null) try { rc(el); } catch(e) {}
            });
            document.querySelectorAll('button,a').forEach(b => {
                const t = b.textContent.trim().toLowerCase();
                if ((t==='ok'||t==='entendi'||t==='fechar'||t==='confirmar'||t==='sim'||t==='continuar') && b.offsetParent!==null && b.offsetWidth>0) {
                    const ic = b.id && (b.id.toLowerCase().indexOf('carrinho')>=0 || b.id.toLowerCase().indexOf('pagamento')>=0);
                    if (!ic) try { rc(b); } catch(e) {}
                }
            });
        }

        function cn(n) {
            const p = String(n).padStart(2, '0');
            let el = document.getElementById('n' + p);
            if (el) return rc(el);
            el = document.querySelector('a#n' + p) || document.querySelector('#n' + p);
            if (el) return rc(el);
            const all = document.querySelectorAll('a[role=button],a.dezena,a.numero,a[id^=n]');
            for (let i = 0; i < all.length; i++) if (all[i].textContent.trim() === p) return rc(all[i]);
            return false;
        }

        function lmp() {
            fm();
            let b = document.getElementById('limparvolante');
            if (b) return rc(b);
            b = document.querySelector('[id*=limpar]');
            if (b) return rc(b);
            const bs = document.querySelectorAll('button');
            for (let k = 0; k < bs.length; k++) if (bs[k].textContent.toLowerCase().indexOf('limpar') >= 0) return rc(bs[k]);
            return false;
        }

        async function selTime() {
            if (!isTM) return true;
            await d(500);
            const ts = document.querySelectorAll('[data-selecionar-time-do-coracao],img[name=btnTime],.time-coracao img');
            if (ts.length > 0) { rc(ts[Math.floor(Math.random() * ts.length)]); await d(800); return true; }
            return false;
        }

        async function selMes() {
            if (!isDS) return true;
            await d(500);
            const s = document.querySelector('select');
            if (s && s.options.length > 1) {
                s.selectedIndex = Math.floor(Math.random() * (s.options.length - 1)) + 1;
                s.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
            return false;
        }

        async function car() {
            fm(); await d(300);
            if (isTM) { await selTime(); await d(600); }
            if (isDS) { await selMes(); await d(600); }
            for (let t = 0; t < 8; t++) {
                let b = document.getElementById('colocarnocarrinho');
                if (b && b.offsetParent !== null) {
                    if (b.disabled || b.classList.contains('disabled')) { await d(1500); continue; }
                    rc(b); await d(1500); fm(); await d(600); fm(); return true;
                }
                const ab = document.querySelectorAll('button,a');
                for (let k = 0; k < ab.length; k++) {
                    const tx = ab[k].textContent.toLowerCase().trim();
                    if ((tx.indexOf('colocar no carrinho') >= 0 || (tx.indexOf('carrinho') >= 0 && tx.indexOf('ir para') < 0 && tx.indexOf('ver') < 0)) && ab[k].offsetParent !== null && ab[k].offsetWidth > 0) {
                        rc(ab[k]); await d(1500); fm(); await d(600); fm(); return true;
                    }
                }
                fm(); await d(800);
            }
            return false;
        }

        // Criar barra de progresso
        const pg = document.createElement('div');
        pg.id = 'b2b-ext-progress';
        pg.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(145deg,#0F172A,#1E293B);border-bottom:3px solid #FFD700;padding:14px 18px;box-shadow:0 4px 30px rgba(0,0,0,0.7);font-family:sans-serif;';
        pg.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#FFD700;font-weight:800;font-size:0.95rem;">🎰 B2B LOTERIAS — Automação</span><span id="b2b-ext-txt" style="color:#E2E8F0;font-size:0.85rem;font-weight:600;">Preparando...</span><button onclick="this.parentNode.parentNode.remove()" style="background:none;border:none;color:#94A3B8;font-size:1.3rem;cursor:pointer;padding:0 6px;">✕</button></div><div style="margin-top:8px;background:rgba(255,255,255,0.1);border-radius:6px;height:8px;overflow:hidden;"><div id="b2b-ext-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#FFD700,#22C55E);border-radius:6px;transition:width 0.4s ease;"></div></div>';
        document.body.appendChild(pg);

        // Esperar a página carregar completamente
        await d(2000);
        fm();
        await d(1000);

        for (let i = 0; i < T; i++) {
            const j = games[i];
            const pt = document.getElementById('b2b-ext-txt');
            const pb = document.getElementById('b2b-ext-bar');
            if (pt) pt.textContent = 'Jogo ' + (i+1) + ' de ' + T;
            if (pb) pb.style.width = ((i+1)/T*100).toFixed(0) + '%';

            fm();
            if (i > 0) { lmp(); await d(1200); fm(); await d(400); }

            for (let n = 0; n < j.length; n++) {
                if (!cn(j[n])) { await d(200); cn(j[n]); }
                await d(200);
            }

            await d(1200); fm(); await d(400);
            const ok = await car();
            if (ok) OK++; else ER++;
            if (i < T - 1) { await d(1500); fm(); }
        }

        // Resultado final
        const pp = document.getElementById('b2b-ext-progress');
        if (pp) {
            pp.style.borderColor = '#22C55E';
            pp.innerHTML = '<div style="text-align:center;padding:10px;"><div style="color:#22C55E;font-weight:800;font-size:1.1rem;margin-bottom:6px;">✅ PRONTO! ' + OK + '/' + T + ' jogos no carrinho!</div>' +
                (ER > 0 ? '<div style="color:#F59E0B;font-size:0.85rem;margin-bottom:6px;">⚠️ ' + ER + ' erro(s)</div>' : '') +
                '<div style="color:#CBD5E1;font-size:0.82rem;margin-bottom:10px;">Clique no carrinho para finalizar a compra.</div>' +
                '<button onclick="this.parentNode.parentNode.remove()" style="background:linear-gradient(135deg,#22C55E,#16A34A);color:white;border:none;padding:10px 30px;border-radius:10px;font-weight:800;font-size:0.9rem;cursor:pointer;">FECHAR</button></div>';
        }
    }

    // ═══ INICIALIZAÇÃO ═══
    async function init() {
        // Verificar URL primeiro
        let data = checkURLGames();
        if (data) {
            console.log('[B2B Extension] Jogos encontrados na URL! Iniciando automação...');
            // Esperar o Angular carregar
            await new Promise(r => setTimeout(r, 3000));
            executarAutomacao(data);
            return;
        }

        // Verificar chrome.storage
        data = await checkStorageGames();
        if (data) {
            console.log('[B2B Extension] Jogos encontrados no storage! Iniciando automação...');
            await new Promise(r => setTimeout(r, 3000));
            executarAutomacao(data);
            return;
        }

        console.log('[B2B Extension] Nenhum jogo pendente. Aguardando...');
    }

    // Aguardar DOM e Angular
    if (document.readyState === 'complete') {
        setTimeout(init, 1500);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1500));
    }
})();
