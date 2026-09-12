(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CaratRewards = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const STORAGE_KEY = 'caratSeekIntegrationV2';

  function readState(storage) {
    try {
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
      return { diagnoses: Array.isArray(parsed.diagnoses) ? parsed.diagnoses : [], sync: parsed.sync && typeof parsed.sync === 'object' ? parsed.sync : {} };
    } catch (_) {
      return { diagnoses: [], sync: {} };
    }
  }

  function recordDiagnosis(record, config, storage) {
    if (!record || !record.savedAt || !record.result || !Array.isArray(record.answers)) return { status: 'invalid_diagnosis' };
    const state = readState(storage);
    const id = `diagnosis:${record.savedAt}:${record.result}`;
    if (state.diagnoses.some(item => item.id === id)) return { status: 'duplicate', id };
    state.diagnoses.push({ id, savedAt: record.savedAt, result: String(record.result), answers: record.answers.map(String), schemaVersion: 1 });
    state.sync[id] = { status: 'pending' };
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { status: config && config.bridge && config.bridge.enabled === true ? 'pending' : 'saved_local', id };
  }

  function validateBridge(config) {
    const bridge = config && config.bridge;
    if (!bridge || bridge.enabled !== true) return { enabled: false };
    if (!/^https:\/\//.test(String(bridge.endpoint || ''))) throw new Error('bridge.endpoint must use https');
    if (!String(config.liffId || '').trim()) throw new Error('liffId is required');
    return { enabled: true, endpoint: String(bridge.endpoint).replace(/\/$/, '') };
  }

  async function syncDiagnosis(id, config, storage, idToken, fetchImpl) {
    const bridge = validateBridge(config);
    if (!bridge.enabled) return { status: 'disabled' };
    if (!String(idToken || '').trim()) return { status: 'auth_required' };
    const state = readState(storage);
    const item = state.diagnoses.find(entry => entry.id === id);
    if (!item) return { status: 'not_found' };
    if (state.sync[id] && state.sync[id].status === 'sent') return { status: 'duplicate' };
    try {
      const response = await fetchImpl(`${bridge.endpoint}/v1/diagnoses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ eventId: id, diagnosis: item })
      });
      if (!response.ok) {
        state.sync[id] = { status: 'pending', httpStatus: response.status };
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        return { status: 'pending', httpStatus: response.status };
      }
      state.sync[id] = { status: 'sent', sentAt: new Date().toISOString() };
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { status: 'sent' };
    } catch (_) {
      state.sync[id] = { status: 'unknown' };
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { status: 'unknown' };
    }
  }

  function calculatePurchasePoints(amountYen, basisPoints) {
    const amount = Number(amountYen);
    const rate = basisPoints === undefined ? 100 : Number(basisPoints);
    if (!Number.isInteger(amount) || amount < 0) throw new Error('amountYen must be a non-negative integer');
    if (!Number.isInteger(rate) || rate < 0 || rate > 10000) throw new Error('basisPoints is invalid');
    return Math.floor(amount * rate / 10000);
  }

  function addCalendarMonths(isoDate, months) {
    const source = new Date(isoDate);
    if (Number.isNaN(source.getTime())) throw new Error('issuedAt is invalid');
    if (!Number.isInteger(months) || months <= 0) throw new Error('months must be a positive integer');
    const result = new Date(source.getTime());
    const originalDay = result.getUTCDate();
    result.setUTCDate(1);
    result.setUTCMonth(result.getUTCMonth() + months);
    const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
    result.setUTCDate(Math.min(originalDay, lastDay));
    return result.toISOString();
  }

  return { STORAGE_KEY, readState, recordDiagnosis, validateBridge, syncDiagnosis, calculatePurchasePoints, addCalendarMonths };
});
