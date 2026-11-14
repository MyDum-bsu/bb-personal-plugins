import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { experimental_registerAcpDialect, experimental_acpProviderBridge } from '@get-bb/plugin-sdk/provider-bridge/acp';

const version = '3.18.2';
async function readUsage() {
  const error = (message: string) => ({ supported: true as const, usage: { status: 'error' as const, accountEmail: null, planLabel: 'Start Plan', message } });
  try {
    const home = homedir();
    const modulePath = `${home}/.local/opt/bb-zcode-acp-start-0.84.3/node_modules/zcode-acp-server/dist/config/account-provider.js`;
    const { storeStartPlanJwt } = await import(pathToFileURL(modulePath).href);
    const token = storeStartPlanJwt();
    if (!token) return { supported: true as const, usage: { status: 'unauthenticated' as const } };
    const { deviceMid } = JSON.parse(await readFile(`${home}/.zcode/v2/telemetry-state.json`, 'utf8'));
    if (!deviceMid) return error('ZCode device identity unavailable');
    const url = new URL('https://zcode.z.ai/api/v1/zcode-plan/billing/balance');
    url.searchParams.set('app_version', version);
    const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: {
      Authorization: `Bearer ${token}`, 'User-Agent': `ZCode/${version}`, 'X-ZCode-App-Version': version,
      'X-Title': 'Z Code@electron', 'X-Platform': `${process.platform}-${process.arch}`, 'X-Os-Category': 'linux',
      'X-Client-Language': 'en', 'X-Client-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'HTTP-Referer': 'https://zcode.z.ai', 'X-Device-Mid': deviceMid,
    }});
    const result: any = await response.json();
    if (!response.ok || result.code !== 0 || !result.data) return error(`ZCode balance unavailable (HTTP ${response.status})`);
    const active = (result.data.plans ?? []).filter((p: any) => p.status === 'active');
    if (!active.length) return { supported: true as const, usage: { status: 'expired' as const } };
    const balances = (result.data.balances ?? []).filter((b: any) => b.user_plan_id && active.some((p: any) => p.user_plan_id === b.user_plan_id));
    const windows = balances.flatMap((b: any) => {
      const total = Number(b.total_units), used = Number(b.used_units), end = Number(b.period_end);
      if (!(total > 0) || !Number.isFinite(used)) return [];
      return [{ label: b.show_name || 'Start Plan', usedPercent: Math.min(100, Math.max(0, 100 * used / total)), resetsAt: end > 0 ? new Date(end * 1000).toISOString() : null }];
    });
    if (!windows.length) return error('Start Plan returned no usable token limits');
    return { supported: true as const, usage: { status: 'ok' as const, accountEmail: null, planLabel: active[0]?.name || 'Start Plan', windows } };
  } catch { return error('Could not read Start Plan usage on this machine'); }
}
experimental_registerAcpDialect({ id: 'zcode-start-usage', maintenance: {
  loginCommand: 'Open ZCode and sign in', installer: () => ({ command: 'false', args: [], displayCommand: 'Install ZCode' }),
  readAccount: async () => null, readUsage,
}});
export { experimental_acpProviderBridge as experimental_providerBridge };
