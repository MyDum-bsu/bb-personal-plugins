# ZCode Start Plan in BB

This installs the configuration tested with ZCode desktop 3.18.2 (CLI 0.17.1)
and zcode-acp-server 0.84.3. It extracts only the desktop runtime and provider
catalog from the locally installed AppImage, then registers a separate BB ACP
provider. It reads the existing ZCode login; it does not copy credentials.

```sh
python3 zcode-start/install.py
bb provider models acp-zcode-start
```

Requires Linux, Node.js, npm, `unsquashfs`, BB and an authenticated ZCode
desktop installation at `~/.local/opt/ZCode.AppImage`. Set `ZCODE_APPIMAGE`
to use a different AppImage path. Select **ZCode (Start Plan)** and
**Start Plan › GLM-5.3-Flash** in BB. A matching model in the list does not
prove the account still has quota: verify with a short model request.

The bridge's upstream heuristic assumes that a remembered Coding Plan choice
excludes Start Plan. This account used both, so the script applies a narrow
local patch for the `zai` family. It does not grant entitlement; the server
still decides whether requests are allowed. The script checks the exact upstream
code and refuses unknown versions rather than silently patching them.

The installed runtime and bridge are versioned and separate from ZCode's own
files, so ordinary AppImage and npm updates do not overwrite them. The script
refuses to replace an existing versioned installation. To upgrade, review and
test the new desktop and adapter versions, update the pinned versions and
patch if appropriate, then run the installer. Keep the previous version until
the new one works; changing the BB provider happens only after preparation.
No API keys or tokens belong in this repository or BB's provider settings.

## Start Plan usage

`node zcode-start/usage.mjs` reads the Start Plan balance using the existing ZCode login and device identity, without printing or storing credentials. It reports plan name, model, token use and the end of the billing window. Override `ZCODE_APP_VERSION` and `ZCODE_ACP_DIR` after checking compatibility during upgrades. BB's built-in ACP provider currently exposes no usage reader for this agent, so this command does not add a row to Provider Usage.

## Context window

ZCode 3.18.2's bundled model rules give GLM-5.3 a 1,000,000-token window. The ACP bridge otherwise falls back to 200,000 because it cannot find a per-model entry for the account provider. `node zcode-start/set-context-window.mjs` writes a model-specific rule for `account:zai-start-plan` / `GLM-5.3-Flash`, preserving existing rules and making a backup. The bridge reads the file as it emits usage, so the corrected size appears after a subsequent usage update; the command is idempotent. Review the upstream model rules on upgrades.
