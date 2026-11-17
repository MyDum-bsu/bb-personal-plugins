# Composer Card Scroll

Status cards above the composer — the follow-up list, the queued-message card,
child threads, git changes — are full-width blocks stacked by bb. This plugin
gives them a layout that uses the empty space beside the input, and makes them
scrollable with a wheel.

- Cards pair up two per row instead of one tall tower. The follow-up list keeps
  the full row.
- On panes at least 1650 CSS px wide, the follow-up card moves to the empty
  gutter right of the composer and the queue card to the left one. Each keeps
  its own scrollport (`max-height: 55vh`), so the sticky footer never clips
  them and the message column keeps its width.
- Wheel over a card scrolls the card, not the message list. bb's thread
  viewport captures wheel events over the footer; the plugin's capture listener
  takes the event first and scrolls the card while it still has room.

Install:

```sh
bb plugin install path:/absolute/path/to/bb-personal-plugins/plugins/bb-plugin-composer-scroll
```

Everything is CSS plus one `wheel` listener; there is no server entry to
maintain. The layout is theme-independent — it does not depend on the active
palette.
