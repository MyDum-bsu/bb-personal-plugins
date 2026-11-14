import { defineRpcContract, type BbPluginApi } from '@get-bb/plugin-sdk';
import { z } from 'zod';
const rpc = defineRpcContract({ usage: { input: z.null(), output: z.object({ status: z.string(), planLabel: z.string().nullable(), windows: z.array(z.object({ label: z.string(), usedPercent: z.number(), resetsAt: z.string().nullable() })) }) } });
import { homedir } from 'node:os';
export default function plugin(bb: BbPluginApi) {
  bb.rpc.register(rpc, { usage: async () => {
    const data = await bb.sdk.system.usageLimits({ providerId: "zcode-start-metered" });
    const result = data["zcode-start-metered"];
    if (!result || result.status !== "ok") return { status: result?.status ?? "unavailable", planLabel: null, windows: [] };
    return { status: "ok", planLabel: result.planLabel, windows: result.windows };
  }});
  const home = homedir();
  bb.providers.register({
    id: 'zcode-start-metered', displayName: 'ZCode Start Plan · лимит', family: 'acp',
    icon: 'Toolbox',
    strings: { signInHint: 'Sign in to ZCode on this machine.', expiredHint: 'Sign in to ZCode again.', installUrl: 'https://zcode.z.ai' },
    experimental_bridgeOptions: { acpDialect: 'zcode-start-usage', acpLaunchSpec: {
      displayName: 'ZCode Start Plan', command: `${home}/.local/opt/bb-zcode-acp-start-0.84.3/node_modules/.bin/zcode-acp-server`, args: [],
      env: { ZCODE_BIN: `${home}/.local/opt/bb-zcode-desktop-3.18.2/resources/glm/zcode.cjs`, ZCODE_APP_VERSION: '3.18.2' },
    }},
    maintenance: { health: false, usage: true, installation: false },
    capabilities: { supportsServiceTier: false, supportsNativeUserQuestion: false, fork: 'none', supportsManualCompaction: false, supportsThreadArchive: false, supportsThreadRename: false, permissionModes: ['accept-edits', 'full'], reasoningLevels: ['medium'] },
    reasoningLevels: [{ id: 'medium', label: 'Medium' }], composerActions: [], models: { fallback: [], scope: 'host' },
  });
}
