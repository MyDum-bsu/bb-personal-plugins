# Personal BB plugins

Personal extensions and settings for BB.

## Chat Sidebar

Based on [seoperin/bb-plugin-chat-sidebar](https://github.com/seoperin/bb-plugin-chat-sidebar) v0.2.8. Project headings can be reordered by dragging on desktop; the order is stored in the current browser's local storage. Sticky project headings are disabled (`bb plugin config chat-sidebar set stickyHeadings false`) so they scroll with their groups.

Pinning is project-scoped: a pinned chat stays inside its project group and sorts first there, in bb's manual pin order. There is no separate Pinned group. That is a local change to `groupByProject` in [lib/model.ts](plugins/chat-sidebar/lib/model.ts); upstream renders pins as their own block. The current installation uses a local UI bundle over the upstream cache because changing its source would remove plugin settings — [tools/restore-personal-plugins.sh](tools/restore-personal-plugins.sh) rebuilds the fork and copies its `dist/` into the installed plugin.

## Composer cards

[Composer Card Scroll](plugins/bb-plugin-composer-scroll/README.md) lays the cards above the composer (follow-ups, queue, child threads, git) two per row, moves the follow-up list to the right gutter and the queue to the left one on wide panes, and makes both scroll with the wheel instead of scrolling the message list.

Install locally: `bb plugin install path:/absolute/path/to/bb-personal-plugins/plugins/bb-plugin-composer-scroll`. Unlike the theme tweaks it previously lived in, this is theme-independent.

## Follow Up

Based on [matthewdias/bb-plugins](https://github.com/matthewdias/bb-plugins), version follow-up/v0.8.1. The composer card is visible only when the thread has open follow-ups. Done items remain stored and accessible through the CLI.

Install locally: `bb plugin install path:/absolute/path/to/bb-personal-plugins/plugins/follow-up`

## ZCode Start Plan

The pinned ACP setup and upgrade instructions are in [zcode-start](zcode-start/README.md).

The [ZCode icon plugin](plugins/bb-plugin-zcode-icon/README.md) supplies its provider mark in BB.

## Voice input

[Hex Voice](plugins/bb-plugin-hex-voice/README.md) transcribes BB recordings locally with Hex Parakeet v3.

## opencode harness

[opencode](opencode/README.md) runs the opencode ACP provider on two subscriptions: OpenCode Go and the ChatGPT (Codex) subscription that Pi and omp already use. The config copy lives in `opencode/opencode.jsonc`; ChatGPT credentials are imported into opencode's own store and are not kept here.

## Restoring after a bb restart

A long-running bb server can lose its esbuild helper, after which every plugin
install or reload fails with `frontend bundle build ... The service is no longer
running`. Restart bb, then:

```sh
tools/restore-personal-plugins.sh
```

It installs the composer-card plugin and rebuilds the Chat Sidebar fork over the
installed upstream bundle. Reload the window afterwards.

## Thinking formatting

[Thinking Format](plugins/bb-plugin-thinking-format/README.md) formats bold headings in the live reasoning view.

## Composer code

[Composer Code](plugins/bb-plugin-composer-code) highlights fenced Markdown blocks while drafting, including unfinished blocks. It preserves the Markdown markers and all native composer controls. Install with `bb plugin install path:/absolute/path/to/bb-personal-plugins/plugins/bb-plugin-composer-code`.

## Themes

`noir-orion` is a separate version of `noir-soft` with a dimmed, blurred Orion background in chat windows. The image was copied from `optimization/tracker/tools/portraits/src/orion.jpg`; the CSS embeds a reduced WebP so it works in remote BB clients. Install by copying `themes/noir-orion/theme.css` to `~/.bb/theme/noir-orion/theme.css`, then run `bb theme set noir-orion`. Install [Chat Fade](plugins/bb-plugin-chat-fade/README.md) to fade scrolling messages above the composer without hiding the background. Return to the previous theme with `bb theme set noir-soft`.

`noir-ember` uses the point-matrix Ember artwork from `optimization/tracker/web/lib/portraits/ember.ts` across the whole window, with a frosted sidebar and a gentler blur in the chat. The source image is `optimization/tracker/tools/portraits/src/ember.png`. Install by copying `themes/noir-ember/theme.css` to `~/.bb/theme/noir-ember/theme.css` and running `bb theme set noir-ember`. The previous wallpaper remains available through `bb theme set noir-orion`.

`noir-orion-glass` extends Orion across the entire window, with separate blur for the chat and the glass sidebar. Install its `theme.css` in `~/.bb/theme/noir-orion-glass/` and select it with `bb theme set noir-orion-glass`.

[ZCode Start Plan usage](plugins/bb-plugin-zcode-start-usage/README.md) adds the actual Start Plan token balance to Provider Usage, including the compact sidebar card.

[Pi compatibility](pi/README.md) avoids a duplicate `AskUserQuestion` tool when Pi runs inside BB.

Three Orion palette alternatives are available as `orion-lavender`, `orion-blue` and `orion-copper`. They retain the glass, wallpaper, mobile and message-fade behavior of `noir-orion-glass`; copy each `theme.css` into the corresponding `~/.bb/theme/` directory to install. Select one in Settings → Appearance → Palette; the previous green version remains `noir-orion-glass`.
