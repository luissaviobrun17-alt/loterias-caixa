// B2B Loterias - Background Service Worker
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'storeGames') {
        chrome.storage.local.set({ b2b_pending_games: msg.data }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    if (msg.action === 'getGames') {
        chrome.storage.local.get(['b2b_pending_games'], (result) => {
            sendResponse({ data: result.b2b_pending_games || null });
        });
        return true;
    }
    if (msg.action === 'clearGames') {
        chrome.storage.local.remove(['b2b_pending_games'], () => {
            sendResponse({ success: true });
        });
        return true;
    }
});
