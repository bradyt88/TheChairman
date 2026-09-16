(() => {
  const root = document.querySelector('#app');
  const showError = (error, label='Application error') => {
    if (!root) return;
    const message = error?.message || String(error || 'Unknown error');
    const stack = error?.stack ? `\n\n${error.stack}` : '';
    const safe = `${message}${stack}`.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    root.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#080b11;color:#fff;font-family:system-ui,sans-serif"><section style="width:min(820px,100%);border:1px solid #303744;border-radius:14px;padding:24px;background:#10151d"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#d4af37">The Chairman · Runtime diagnostic</div><h1 style="margin:8px 0 10px">${label}</h1><p style="color:#b7c0cc;line-height:1.6">The game could not complete its startup sequence. This diagnostic now includes the exact module stack so the failing file can be fixed directly.</p><pre style="white-space:pre-wrap;word-break:break-word;background:#090c12;border:1px solid #242b36;border-radius:10px;padding:14px;color:#f2f4f7">${safe}</pre><p style="color:#8792a1;font-size:13px">Build 87. Simulation syntax has been repaired and module dependencies are cache-busted.</p></section></main>`;
  };
  window.addEventListener('error', event => showError(event.error || event.message, 'JavaScript startup error'));
  window.addEventListener('unhandledrejection', event => showError(event.reason, 'Module startup error'));
  import('./app.js?v=97').catch(error => showError(error, 'The Chairman failed to start'));
})();
