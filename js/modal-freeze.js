(() => {
  const root = document.querySelector('#app');
  const freeze = () => {
    document.documentElement.classList.add('modal-open-freeze');
    document.body.classList.add('modal-open-freeze');
    if (root) root.inert = true;
    document.querySelectorAll('body *').forEach(el => {
      if (el.id === 'matchday-fix-overlay' || el.closest('#matchday-fix-overlay')) return;
      if (el instanceof HTMLElement) {
        el.style.setProperty('animation-play-state', 'paused', 'important');
        el.style.setProperty('transition', 'none', 'important');
      }
    });
  };
  const unfreeze = () => {
    document.documentElement.classList.remove('modal-open-freeze');
    document.body.classList.remove('modal-open-freeze');
    if (root) root.inert = false;
    document.querySelectorAll('body *').forEach(el => {
      if (el instanceof HTMLElement && !el.closest('#matchday-fix-overlay')) {
        el.style.removeProperty('animation-play-state');
        el.style.removeProperty('transition');
      }
    });
  };
  const sync = () => document.getElementById('matchday-fix-overlay') ? freeze() : unfreeze();
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
  sync();
})();
