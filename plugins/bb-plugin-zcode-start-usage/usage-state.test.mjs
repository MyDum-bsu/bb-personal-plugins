import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyUsageUpdate } from './usage-state.mjs';
const valid = { status: 'ok', planLabel: 'Start', windows: [{ label: 'Flash', usedPercent: 5, resetsAt: null }] };
test('temporary failure keeps the previous value and marks it stale', () => {
  const before = applyUsageUpdate({ data: null, lastUpdated: 0, stale: false }, valid, 123);
  assert.deepEqual(applyUsageUpdate(before, null, 456), { data: valid, lastUpdated: 123, stale: true });
  assert.deepEqual(applyUsageUpdate(before, {status:'error'}, 456), { data: valid, lastUpdated: 123, stale: true });
});
test('initial failure does not invent a value, recovery clears the stale marker', () => {
  const initial = { data: null, lastUpdated: 0, stale: false };
  assert.deepEqual(applyUsageUpdate(initial, null, 1), initial);
  assert.deepEqual(applyUsageUpdate({ data: valid, lastUpdated: 1, stale: true }, valid, 2), { data: valid, lastUpdated: 2, stale: false });
});
