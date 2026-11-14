// Read the Start Plan's own billing endpoint using the existing ZCode login.
// Credentials are loaded in-process and never printed or stored by this script.
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';

const home = homedir();
const version = process.env.ZCODE_APP_VERSION || '3.18.2';
const adapter = process.env.ZCODE_ACP_DIR || `${home}/.local/opt/bb-zcode-acp-start-0.84.3`;
try {
  const { storeStartPlanJwt } = await import(pathToFileURL(`${adapter}/node_modules/zcode-acp-server/dist/config/account-provider.js`));
  const token = storeStartPlanJwt();
  if (!token) throw new Error('ZCode login unavailable');
  const device = JSON.parse(await readFile(`${home}/.zcode/v2/telemetry-state.json`, 'utf8')).deviceMid;
  if (!device) throw new Error('ZCode device identifier unavailable');
  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': `ZCode/${version}`,
    'X-ZCode-App-Version': version,
    'X-Title': 'Z Code@electron',
    'X-Platform': `${process.platform}-${process.arch}`,
    'X-Os-Category': 'linux',
    'X-Client-Language': 'en',
    'X-Client-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    'HTTP-Referer': 'https://zcode.z.ai',
    'X-Device-Mid': device,
  };
  const url = new URL('https://zcode.z.ai/api/v1/zcode-plan/billing/balance');
  url.searchParams.set('app_version', version);
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  if (!response.ok || data.code !== 0 || !data.data) throw new Error(`Balance request failed (HTTP ${response.status}, code ${data.code ?? 'unknown'})`);
  const plans = (data.data.plans ?? []).filter(p => p.status === 'active');
  const balances = (data.data.balances ?? []).filter(b => plans.some(p => b.user_plan_id && p.user_plan_id === b.user_plan_id));
  const windows = balances.flatMap(b => {
    const total = Number(b.total_units), used = Number(b.used_units);
    if (!(total > 0) || !Number.isFinite(used)) return [];
    const end = Number(b.period_end);
    return [{ label: b.show_name || 'Start Plan', unit: b.unit_type || null, used, total, usedPercent: 100 * used / total, resetsAt: end > 0 ? new Date(end * 1000).toISOString() : null }];
  });
  console.log(JSON.stringify({ status: plans.length ? 'ok' : 'no_active_plan', planLabel: plans[0]?.name ?? 'Start Plan', windows }, null, 2));
} catch (error) {
  console.error(`Start Plan usage unavailable: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
}
