// Load the installed Pi question extension unless BB provides the same tool.
import { readFileSync } from 'node:fs';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import original from '../npm/node_modules/@mazli/pi-ask-user-question/extensions/index.ts';

export default function bbCompatibleQuestion(pi: ExtensionAPI) {
  if (process.argv.some(arg => /(?:^|\/)bb-pi-extension\.mjs$/.test(arg)) && process.env.PI_BB_TOOLS_FILE) {
    try {
      const tools = JSON.parse(readFileSync(process.env.PI_BB_TOOLS_FILE, 'utf8'));
      if (Array.isArray(tools) && tools.some(tool => tool?.name === 'AskUserQuestion')) return;
    } catch { /* Preserve normal Pi behavior when the BB tool list is unavailable. */ }
  }
  return original(pi);
}
