(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JummaiCheckoutGuard = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const EXPECTED = Object.freeze({ productCode: 'rob6-tasting-4', amountYen: 22000, currency: 'JPY' });
  function validate(config) {
    if (!config || typeof config !== 'object') return { ok: false, reason: 'configuration_required' };
    if (config.provider !== 'komoju') return { ok: false, reason: 'provider_mismatch' };
    if (config.environment !== 'test') return { ok: false, reason: 'test_environment_required' };
    if (!String(config.testEvidenceRef || '').trim()) return { ok: false, reason: 'test_evidence_required' };
    if (config.productCode !== EXPECTED.productCode || config.amountYen !== EXPECTED.amountYen || config.currency !== EXPECTED.currency) return { ok: false, reason: 'offer_mismatch' };
    let parsed;
    try { parsed = new URL(String(config.url || '')); } catch (_) { return { ok: false, reason: 'invalid_url' }; }
    if (parsed.protocol !== 'https:' || !/(^|\.)komoju\.com$/i.test(parsed.hostname) || parsed.username || parsed.password) return { ok: false, reason: 'untrusted_url' };
    return { ok: true, url: parsed.href, expected: EXPECTED };
  }
  return { EXPECTED, validate };
});
