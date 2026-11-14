# Pi in BB

`node pi/fix-bb-question-conflict.mjs` applies a narrow compatibility guard to the installed `@mazli/pi-ask-user-question` extension. If Pi is started with BB's `bb-pi-extension.mjs` and BB's tool list contains `AskUserQuestion`, the standalone extension skips its duplicate tool registration; otherwise it behaves normally. The original file is saved next to it as `index.ts.bb-original`. Reapply after updating the npm package; the script checks the expected source and refuses unfamiliar versions.
