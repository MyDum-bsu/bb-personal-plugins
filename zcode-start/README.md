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
