// A failed refresh must never turn a known balance into zero or an unknown one.
export function applyUsageUpdate(state, result, now = Date.now()) {
  if (result?.status === 'ok' && Array.isArray(result.windows) && result.windows.length > 0) {
    return { data: result, lastUpdated: now, stale: false };
  }
  return { ...state, stale: Boolean(state.data) };
}
