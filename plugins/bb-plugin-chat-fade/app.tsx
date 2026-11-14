import { definePluginApp } from "@get-bb/plugin-sdk/app";

// Report the sticky footer position relative to the scrolling message content.
// The selected theme decides whether and how to use these variables.
export default definePluginApp((app) => {
  app.contentScripts.register({
    id: "message-footer-fade",
    mount({ signal }) {
      const targets = new Set<HTMLElement>();
      const observed = new Set<HTMLElement>();
      let frame = 0;
      const resize = new ResizeObserver(schedule);
      function schedule() {
        if (!frame) frame = requestAnimationFrame(update);
      }
      function update() {
        frame = 0;
        const current = new Set<HTMLElement>();
        const toObserve = new Set<HTMLElement>();
        document.querySelectorAll<HTMLElement>("[data-thread-window] [data-page-scroll-viewport]").forEach((viewport) => {
          const content = viewport.querySelector<HTMLElement>('[data-timeline-row-list="top-level"]');
          const footer = viewport.querySelector<HTMLElement>("[data-scroll-footer]");
          if (!content || !footer) return;
          current.add(content);
          toObserve.add(viewport);
          toObserve.add(footer);
          const atEnd = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <= 2;
          // At the end messages are already above the footer; keep the last
          // lines fully visible instead of fading useful content.
          const bottom = atEnd ? content.scrollHeight + 100 : Math.max(0, footer.getBoundingClientRect().top - content.getBoundingClientRect().top);
          const start = atEnd ? bottom - 1 : Math.max(0, bottom - 28);
          content.style.setProperty("--bb-orion-fade-start", `${start}px`);
          content.style.setProperty("--bb-orion-fade-end", `${Math.max(start + 1, bottom)}px`);
        });
        for (const element of observed) if (!toObserve.has(element)) {
          resize.unobserve(element);
          observed.delete(element);
        }
        for (const element of toObserve) if (!observed.has(element)) {
          resize.observe(element);
          observed.add(element);
        }
        for (const target of targets) if (!current.has(target)) {
          target.style.removeProperty("--bb-orion-fade-start");
          target.style.removeProperty("--bb-orion-fade-end");
        }
        targets.clear();
        for (const target of current) targets.add(target);
      }
      const mutations = new MutationObserver(schedule);
      mutations.observe(document.body, { subtree: true, childList: true });
      document.addEventListener("scroll", schedule, { capture: true, passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      schedule();
      let disposed = false;
      const dispose = () => {
        if (disposed) return;
        disposed = true;
        mutations.disconnect();
        resize.disconnect();
        document.removeEventListener("scroll", schedule, true);
        window.removeEventListener("resize", schedule);
        cancelAnimationFrame(frame);
        for (const target of targets) {
          target.style.removeProperty("--bb-orion-fade-start");
          target.style.removeProperty("--bb-orion-fade-end");
        }
        targets.clear();
      };
      signal.addEventListener("abort", dispose, { once: true });
      return dispose;
    },
  });
});
