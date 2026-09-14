const KEY = 'the-chairman-save-v1';
export function saveGame(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function loadGame() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }
export function clearGame() { localStorage.removeItem(KEY); }
