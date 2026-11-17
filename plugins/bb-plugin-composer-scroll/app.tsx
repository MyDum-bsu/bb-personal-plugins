// bb-plugin-composer-scroll — frontend.
//
// Two jobs, both about the status cards (follow-ups, queue, child threads,
// git) that bb stacks above the composer:
//
// 1. Layout. By default each card is a full-width block above the input, so a
//    few cards push the reading area up. This plugin lays them out two-up, and
//    on very wide panes moves the follow-up list into the empty gutter on the
//    right and the queue into the gutter on the left. Cards keep their own
//    scrollport, so nothing is clipped by the footer.
// 2. Wheel. bb's thread viewport captures wheel events over the composer and
//    scrolls the message list, so a card taller than its box cannot be
//    scrolled with a wheel. The capture listener below scrolls the card
//    instead while it has somewhere to go.
import { definePluginApp } from "@get-bb/plugin-sdk/app";

const CARD_SELECTOR = 'section[aria-label="follow-up"], section[aria-label="Queued messages"]';

const LAYOUT_CSS = `
[data-thread-window] [data-scroll-footer] [data-app-composer] > div.grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  align-items: stretch;
}
[data-thread-window] [data-scroll-footer] [data-app-composer] > div.grid > * {
  min-width: 0;
}
[data-thread-window] [data-scroll-footer] [data-app-composer] section[aria-label="follow-up"] {
  grid-column: 1 / -1;
}

@container page (min-width: 1650px) {
  [data-thread-window] [data-scroll-footer] .chat-prompt-box {
    position: relative;
  }
  [data-thread-window] [data-scroll-footer] [data-app-composer],
  [data-thread-window] [data-scroll-footer] [data-app-composer] > div.grid {
    display: contents;
  }
  [data-thread-window] [data-scroll-footer] [data-app-composer] section[aria-label="follow-up"] {
    position: absolute;
    left: calc(100% + 24px);
    bottom: 0;
    width: 340px;
    max-height: 55vh;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }
  [data-thread-window] [data-scroll-footer] [data-app-composer] section[aria-label="Queued messages"] {
    position: absolute;
    right: calc(100% + 24px);
    bottom: 0;
    width: 340px;
    max-height: 55vh;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }
}
`;

export default definePluginApp((app) => {
  app.contentScripts.register({
    id: "composer-card-layout",
    mount({ signal }) {
      const style = document.createElement("style");
      style.dataset.composerScroll = "layout";
      style.textContent = LAYOUT_CSS;
      document.head.append(style);

      const onWheel = (event: WheelEvent) => {
        if (!(event.target instanceof Element)) return;
        const card = event.target.closest(CARD_SELECTOR);
        if (!(card instanceof HTMLElement)) return;
        // Nothing to scroll, or already at that edge: let the message list have it.
        if (card.scrollHeight <= card.clientHeight) return;
        const atStart = card.scrollTop <= 0 && event.deltaY < 0;
        const atEnd = card.scrollTop + card.clientHeight >= card.scrollHeight - 1 && event.deltaY > 0;
        if (atStart || atEnd) return;
        card.scrollTop += event.deltaY;
        event.preventDefault();
        event.stopPropagation();
      };
      document.addEventListener("wheel", onWheel, { capture: true, passive: false });

      signal.addEventListener(
        "abort",
        () => {
          document.removeEventListener("wheel", onWheel, true);
          style.remove();
        },
        { once: true },
      );
    },
  });
});
