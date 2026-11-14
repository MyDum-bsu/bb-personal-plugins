# Pi in BB

`node pi/install-bb-question-wrapper.mjs` installs a small wrapper at `~/.pi/agent/extensions/bb-ask-user-question.ts` and uses Pi's supported per-package resource filter to prevent the upstream question extension loading twice. The npm package remains installed and unmodified; the wrapper imports its current implementation, including after package updates. For ordinary Pi it invokes the original extension; when BB supplies its own `AskUserQuestion`, it skips the duplicate registration.

The installer saves `settings.json.bb-question-backup`, restores the original npm file if the older local patch is present, and refuses to overwrite unfamiliar wrapper files or package filters. Test with Pi offline RPC and BB's question tool. The wrapper assumes the upstream extension keeps its entry path and default export; review compatibility if those change.
