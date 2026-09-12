(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CaratLiffSync = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const LIFF_SDK_URL = 'https://static.line-scdn.net/liff/edge/2/sdk.js';

  function loadLiffSdk(documentRef) {
    if (typeof window !== 'undefined' && window.liff) return Promise.resolve(window.liff);
    return new Promise((resolve, reject) => {
      const existing = documentRef.querySelector('script[data-carat-liff-sdk]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.liff), { once: true });
        existing.addEventListener('error', () => reject(new Error('liff_sdk_load_failed')), { once: true });
        return;
      }
      const script = documentRef.createElement('script');
      script.src = LIFF_SDK_URL;
      script.charset = 'utf-8';
      script.dataset.caratLiffSdk = 'true';
      script.onload = () => resolve(window.liff);
      script.onerror = () => reject(new Error('liff_sdk_load_failed'));
      documentRef.head.append(script);
    });
  }

  async function syncLatest(config, rewards, storage, dependencies) {
    const bridge = config && config.bridge;
    if (!bridge || bridge.enabled !== true) return { status: 'disabled' };
    if (!String(config.liffId || '').trim()) return { status: 'configuration_required' };
    const deps = dependencies || {};
    let liff;
    try {
      liff = deps.liff || await (deps.loadSdk || loadLiffSdk)(deps.document || document);
      await liff.init({ liffId: config.liffId });
    } catch (_) {
      return { status: 'liff_unavailable' };
    }
    if (!liff.isLoggedIn()) return { status: 'login_required' };
    const idToken = liff.getIDToken();
    if (!idToken) return { status: 'token_unavailable' };
    const state = rewards.readState(storage);
    const item = [...state.diagnoses].reverse().find(entry => !state.sync[entry.id] || state.sync[entry.id].status !== 'sent');
    if (!item) return { status: 'nothing_to_sync' };
    return rewards.syncDiagnosis(item.id, config, storage, idToken, deps.fetch || fetch);
  }

  return { LIFF_SDK_URL, loadLiffSdk, syncLatest };
});
