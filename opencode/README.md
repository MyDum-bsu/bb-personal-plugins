# opencode harness

`opencode.jsonc` is the copy of `~/.config/opencode/opencode.jsonc` that the
opencode harness uses on this machine. It is stored here so the setup survives a
reinstall; copy it back with:

```sh
cp opencode/opencode.jsonc ~/.config/opencode/opencode.jsonc
```

## What it configures

- `enabled_providers: ["opencode-go", "openai"]` — the OpenCode Go subscription
  and the ChatGPT (Codex) subscription are both available. Without `openai` here
  the OpenAI models exist but never reach bb's model picker.
- `model: "opencode-go/deepseek-v4.1-flash"` — the default model, matching Pi.
- `providers.opencode-go.models` — the Go catalog is narrowed to the models that
  are actually used (DeepSeek V4 Pro / V4.1 Flash, Hy4 Flash Free, Qwen4 Max).
  Remove entries to expose more of the subscription.
- `mcp` and `permission` — local search MCP servers (disabled) and the
  permission policy.

## ChatGPT credentials

opencode stores credentials in `~/.local/share/opencode`; none of them belong in
this repository. The `openai` integration was filled from the Codex CLI tokens
that Pi and omp already use:

```sh
# tokens live in ~/.codex/auth.json; build an import file in a temp dir with 0600
opencode auth import /path/to/credential.json   # integrationID "openai", type "oauth", methodID "chatgpt-browser"
opencode auth switch openai "ChatGPT browser tokens"
opencode auth list                              # OpenAI ... stored
```

A credential imported with `methodID: "chatgpt-token-sharing"` is rejected with
`Missing scopes: api.responses.write`; the browser variant talks to the ChatGPT
backend instead. The access token lasts about a day, and opencode refreshes it
with the same client id the Codex CLI uses.

## Verify

```sh
opencode models | cut -d/ -f1 | sort | uniq -c   # openai + opencode-go
bb provider models acp-opencode --environment "$BB_ENVIRONMENT_ID" --json | jq 'length'
```

bb caches the catalog for about a minute; a fresh `bb provider models` after
that shows the OpenAI models. Account quota is separate from configuration: with
the ChatGPT weekly limit exhausted, a request answers `The usage limit has been
reached` until the reset time reported by `bb settings usage`.
