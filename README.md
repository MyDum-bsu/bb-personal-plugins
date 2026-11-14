# Personal BB plugins

Personal extensions and settings for BB.

## Chat Sidebar

Based on [seoperin/bb-plugin-chat-sidebar](https://github.com/seoperin/bb-plugin-chat-sidebar) v0.2.8. Pinned chats come first, followed by waiting, working and other chats; each group is ordered by activity. Project headings can be reordered by dragging on desktop; the order is stored in the current browser's local storage. The current installation uses a local UI bundle over the upstream cache because changing its source would remove plugin settings.

## Follow Up

Based on [matthewdias/bb-plugins](https://github.com/matthewdias/bb-plugins), version follow-up/v0.8.1. The composer card is visible only when the thread has open follow-ups. Done items remain stored and accessible through the CLI.

Install locally: `bb plugin install path:/absolute/path/to/bb-personal-plugins/plugins/follow-up`

## ZCode Start Plan

The pinned ACP setup and upgrade instructions are in [zcode-start](zcode-start/README.md).

The [ZCode icon plugin](plugins/bb-plugin-zcode-icon/README.md) supplies its provider mark in BB.

## Voice input

[Hex Voice](plugins/bb-plugin-hex-voice/README.md) transcribes BB recordings locally with Hex Parakeet v3.

## Thinking formatting

[Thinking Format](plugins/bb-plugin-thinking-format/README.md) formats bold headings in the live reasoning view.

## Themes

`noir-orion` is a separate version of `noir-soft` with a dimmed, blurred Orion background in chat windows. The image was copied from `optimization/tracker/tools/portraits/src/orion.jpg`; the CSS embeds a reduced WebP so it works in remote BB clients. Install by copying `themes/noir-orion/theme.css` to `~/.bb/theme/noir-orion/theme.css`, then run `bb theme set noir-orion`. Install [Chat Fade](plugins/bb-plugin-chat-fade/README.md) to fade scrolling messages above the composer without hiding the background. Return to the previous theme with `bb theme set noir-soft`.

`noir-ember` uses the point-matrix Ember artwork from `optimization/tracker/web/lib/portraits/ember.ts` across the whole window, with a frosted sidebar and a gentler blur in the chat. The source image is `optimization/tracker/tools/portraits/src/ember.png`. Install by copying `themes/noir-ember/theme.css` to `~/.bb/theme/noir-ember/theme.css` and running `bb theme set noir-ember`. The previous wallpaper remains available through `bb theme set noir-orion`.

`noir-orion-glass` extends Orion across the entire window, with separate blur for the chat and the glass sidebar. Install its `theme.css` in `~/.bb/theme/noir-orion-glass/` and select it with `bb theme set noir-orion-glass`.
