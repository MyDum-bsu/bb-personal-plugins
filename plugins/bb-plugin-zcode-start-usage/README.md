# ZCode Start Plan usage for BB

Adds a separate provider bridge so BB's Provider Usage can display live ZCode Start Plan token usage. Existing `acp-zcode-start` sessions remain unchanged. The extra provider is labelled «ZCode Start Plan · лимит» to distinguish it from the existing agent; keep using the existing agent for chats, since ZCode's default model can be a Coding Plan model.

The host bridge reads the installed ZCode credential store via the existing pinned ACP adapter and uses ZCode's own device identity and balance endpoint. It never sends credentials to the BB server or stores them in plugin settings. Only plan name and usage windows are returned. Errors or missing balances are reported as unavailable, not zero.

Requires the pinned local runtime and adapter from `../../zcode-start/install.py` (ZCode 3.18.2, zcode-acp-server 0.84.3); review the paths and headers during upgrades. Install with `bb plugin install --yes path:/absolute/path/to/bb-plugin-zcode-start-usage`, and verify with `bb settings usage --machine <host-id> --json`.

The bundled Provider Usage UI currently filters out custom provider entries. This plugin therefore adds its own row to the existing settings list and compact sidebar card, updating it every minute. Its row is displayed alongside Codex or OpenCode and reports failures as unavailable.
