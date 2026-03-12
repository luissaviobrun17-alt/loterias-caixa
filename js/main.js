// Global UI usage

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    ui.initEvents(); // initEvents already calls initQuantum, initCopyEvents, initShareEvents, initTutorialEvents, initInstallEvents
    ui.updateGameInfo('megasena');
    ui.addInstallButton();
});
