// Global UI usage

document.addEventListener('DOMContentLoaded', function() {
    try {
        var ui = new UI();
        ui.initEvents();
        ui.updateGameInfo('megasena');
        ui.addInstallButton();
    } catch(e) {
        alert('ERRO B2B: ' + e.message + '\n\nLinha: ' + (e.stack || ''));
    }
});
