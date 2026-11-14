import { readFile, writeFile, copyFile, rename, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(homedir(), '.pi/agent');
const settings = join(dir, 'settings.json');
const extension = join(dir, 'extensions/bb-ask-user-question.ts');
const upstream = join(dir, 'npm/node_modules/@mazli/pi-ask-user-question/extensions/index.ts');
const backup = `${upstream}.bb-original`;
const raw = await readFile(settings, 'utf8');
const cfg = JSON.parse(raw);
if (!Array.isArray(cfg.packages)) throw new Error('Pi package configuration missing');
const matching = cfg.packages.filter(p => (typeof p === 'string' ? p : p?.source) === 'npm:@mazli/pi-ask-user-question');
if (matching.length !== 1) throw new Error('Expected exactly one pi-ask-user-question package');
const entry = matching[0];
if (typeof entry !== 'string' && entry.extensions && entry.extensions.length !== 0) throw new Error('Package has custom extension filters; review before installation');
cfg.packages = cfg.packages.map(p => p === entry ? { ...(typeof p === 'object' ? p : {source:p}), extensions: [] } : p);
await mkdir(dirname(extension), { recursive: true });
const wrapper = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'bb-ask-user-question.ts'), 'utf8');
try { const existing = await readFile(extension, 'utf8'); if (existing !== wrapper) throw new Error('Wrapper path already contains different user data'); } catch (e) { if (e.code !== 'ENOENT') throw e; await writeFile(extension, wrapper, {flag:'wx'}); }
try { await copyFile(settings, `${settings}.bb-question-backup`, constants.COPYFILE_EXCL); } catch (e) { if (e.code !== 'EEXIST') throw e; }
const before = await readFile(upstream, 'utf8');
if (before.includes('// BB compatibility: use the BB question tool when it is present.')) {
  const original = await readFile(backup, 'utf8');
  if (!original.includes('export default function askUserQuestion')) throw new Error('Unexpected upstream backup');
  await writeFile(upstream, original);
}
const tmp = `${settings}.bb-${process.pid}.tmp`;
await writeFile(tmp, JSON.stringify(cfg, null, 2) + '\n', {mode:0o600, flag:'wx'});
await rename(tmp, settings);
console.log('Installed update-safe Pi question wrapper');
