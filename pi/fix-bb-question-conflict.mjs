// Keep the standalone Pi question extension, while allowing BB's own tool to
// take precedence only when BB actually supplies the same tool.
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir } from 'node:os';
const file = `${homedir()}/.pi/agent/npm/node_modules/@mazli/pi-ask-user-question/extensions/index.ts`;
let source = await readFile(file, 'utf8');
const marker = '// BB compatibility: use the BB question tool when it is present.';
const anchor = 'export default function askUserQuestion(pi: ExtensionAPI) {\n';
if (source.includes(marker)) { console.log('BB compatibility fix already installed'); process.exit(0); }
if (source.split(anchor).length !== 2) throw new Error('Extension changed; inspect it before applying the patch');
const guard = `${anchor}\t${marker}\n\tif (process.argv.some((arg) => /(?:^|\\/)bb-pi-extension\\.mjs$/.test(arg)) && process.env.PI_BB_TOOLS_FILE) {\n\t\ttry {\n\t\t\tconst bbTools = JSON.parse(readFileSync(process.env.PI_BB_TOOLS_FILE, "utf8"));\n\t\t\tif (Array.isArray(bbTools) && bbTools.some((tool) => tool?.name === "AskUserQuestion")) return;\n\t\t} catch { /* Let Pi report configuration errors normally. */ }\n\t}\n`;
source = 'import { readFileSync } from "node:fs";\n' + source.replace(anchor, guard);
try { await copyFile(file, `${file}.bb-original`, constants.COPYFILE_EXCL); } catch (e) { if (e.code !== 'EEXIST') throw e; }
await writeFile(file, source);
console.log('Applied Pi BB question-tool compatibility fix');
