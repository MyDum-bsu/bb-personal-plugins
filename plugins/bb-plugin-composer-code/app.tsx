import { definePluginApp } from "@get-bb/plugin-sdk/app";

export function fencedCodeRanges(text: string) {
  const lines = text.split("\n");
  const ranges: { from: number; to: number }[] = [];
  let offset = 0;
  let start: number | null = null;
  for (const line of lines) {
    if (start === null && /^ {0,3}`{3}[^`]*$/.test(line)) {
      start = offset;
    } else if (start !== null && /^ {0,3}`{3,}\s*$/.test(line)) {
      ranges.push({ from: start, to: offset + line.length });
      start = null;
    }
    offset += line.length + 1;
  }
  if (start !== null && text.length > start) ranges.push({ from: start, to: text.length });
  return ranges;
}

export default definePluginApp((app) => {
  app.contentScripts.register({
    id: "fenced-code-styles",
    mount({ signal }) {
      const style = document.createElement("style");
      style.textContent = `
        .tiptap .bb-composer-fenced-code { color: #ddd5cf; background: rgba(66, 57, 54, .8); font-family: var(--font-mono, monospace); border-radius: 3px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
        .tiptap p:has(> .bb-composer-fenced-code):not(:has(br)) { background: rgba(66, 57, 54, .8); padding: 2px 10px; }
        .tiptap p:has(> .bb-composer-fenced-code):not(:has(br)) > .bb-composer-fenced-code { background: transparent; }
        .tiptap p:has(> .bb-composer-fenced-code):not(:has(br)):not(p:has(> .bb-composer-fenced-code) + p) { border-radius: 8px 8px 0 0; }
        .tiptap p:has(> .bb-composer-fenced-code):not(:has(br)):not(:has(+ p > .bb-composer-fenced-code)) { border-radius: 0 0 8px 8px; }
        .tiptap p:has(> .bb-composer-fenced-code):not(:has(br)):not(p:has(> .bb-composer-fenced-code) + p):not(:has(+ p > .bb-composer-fenced-code)) { border-radius: 8px; }
      `;
      document.head.append(style);
      signal.addEventListener("abort", () => style.remove(), { once: true });
      return () => style.remove();
    },
  });
  app.composer.customize({
    id: "fenced-code",
    richText: { effects: [{ id: "code-block", className: "bb-composer-fenced-code", match: fencedCodeRanges }] },
  });
});
