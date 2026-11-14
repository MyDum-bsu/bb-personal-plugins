import { definePluginApp } from "@get-bb/plugin-sdk/app";

// BB 0.49 renders active reasoning as a plain-text div with these classes.
const selector = "div.max-h-80.overflow-auto.whitespace-pre-wrap.break-words.border-l.pl-3";
const mark = "data-bb-thinking-format";

export default definePluginApp((app) => {
  app.contentScripts.register({
    id: "format-reasoning-headings",
    mount({ signal }) {
      const originals = new Map<Element, string>();
      const format = (element: Element) => {
        // Only touch the host's original plain text, not controls or other markup.
        if (element.childNodes.length !== 1 || element.firstChild?.nodeType !== Node.TEXT_NODE) return;
        const text = element.textContent ?? "";
        const pattern = /\*\*([^*\n]+)\*\*/g;
        if (!pattern.test(text)) return;
        pattern.lastIndex = 0;
        const wrapper = document.createElement("span");
        wrapper.setAttribute(mark, "");
        let last = 0;
        for (const match of text.matchAll(pattern)) {
          wrapper.append(document.createTextNode(text.slice(last, match.index)));
          const bold = document.createElement("strong");
          bold.textContent = match[1];
          wrapper.append(bold);
          last = match.index! + match[0].length;
        }
        wrapper.append(document.createTextNode(text.slice(last)));
        originals.set(element, text);
        element.replaceChildren(wrapper);
      };
      const scan = (root: Node) => {
        if (root.nodeType !== Node.ELEMENT_NODE) return;
        const element = root as Element;
        if (element.matches(selector)) format(element);
        element.querySelectorAll(selector).forEach(format);
      };
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") {
            const parent = mutation.target.parentElement;
            if (parent?.matches(selector)) format(parent);
          } else {
            const target = mutation.target as Element;
            if (target.matches?.(selector)) format(target);
            mutation.addedNodes.forEach(scan);
          }
        }
        for (const element of originals.keys()) {
          if (!element.isConnected) originals.delete(element);
        }
      });
      observer.observe(document.body, { childList: true, characterData: true, subtree: true });
      scan(document.body);
      const dispose = () => {
        observer.disconnect();
        for (const [element, original] of originals) {
          if (element.childNodes.length === 1 && element.firstElementChild?.hasAttribute(mark)) {
            element.textContent = original;
          }
        }
        originals.clear();
      };
      signal.addEventListener("abort", dispose, { once: true });
      return dispose;
    },
  });
});
