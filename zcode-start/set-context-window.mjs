// Install the model-specific window from ZCode 3.18.2's bundled model rules.
import { readFile, writeFile, copyFile, rename } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir } from 'node:os';
const file = `${homedir()}/.zcode/v2/provider_config.json`;
const raw = await readFile(file, 'utf8');
const config = JSON.parse(raw);
const rules = config?.config?.modelConfigRules?.providerModelRules;
if (!Array.isArray(rules)) throw new Error('Unexpected ZCode provider configuration');
const matches = rules.filter(r => r.providerId === 'account:zai-start-plan' && r.modelId === 'GLM-5.3-Flash');
if (matches.length > 1) throw new Error('Ambiguous model configuration');
if (matches[0]?.config?.properties?.contextWindow === 1000000) {
  console.log('Start Plan GLM-5.3-Flash context is already 1,000,000');
} else {
  if (matches.length) {
    const model = matches[0]; model.config ||= {}; model.config.properties ||= {}; model.config.properties.contextWindow = 1000000;
  } else rules.push({ providerId: 'account:zai-start-plan', modelId: 'GLM-5.3-Flash', config: { properties: { contextWindow: 1000000 } } });
  const backup = `${file}.bb-context-backup`;
  try { await copyFile(file, backup, constants.COPYFILE_EXCL); } catch (e) { if (e.code !== 'EEXIST') throw e; }
  const temp = `${file}.bb-context-${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(config, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  await rename(temp, file);
  console.log('Configured 1,000,000-token Start Plan context; backup:', backup);
}
