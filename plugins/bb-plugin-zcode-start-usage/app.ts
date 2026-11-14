import { definePluginApp } from '@get-bb/plugin-sdk/app';

export default definePluginApp(app => {
  app.contentScripts.register({ id: 'start-plan-in-usage-list', mount({ signal }) {
    let pending = false, disposed = false;
    let data: any = null;
    const draw = () => {
      if (disposed) return;
      // Attach only to Provider Usage lists containing a known provider row.
      for (const logo of document.querySelectorAll('[data-provider-logo*="/acp-opencode/"], [data-provider-logo*="/codex/"]')) {
        const row = logo.closest('section');
        const list = row?.parentElement?.parentElement;
        if (!list || list.querySelector('[data-zcode-start-usage]')) continue;
        if (list.closest('[role="tabpanel"][aria-label*="usage"]')) {
          const wrap = document.createElement('div'); wrap.dataset.zcodeStartUsage = 'true';
          wrap.className = 'col-span-full grid grid-cols-subgrid gap-y-2 border-t border-sidebar-border pt-2.5';
          const section = document.createElement('section'); section.className = 'col-span-full grid grid-cols-subgrid';
          section.setAttribute('aria-label', 'ZCode Start Plan');
          const head = document.createElement('div'); head.className = 'col-span-full flex h-5 min-w-0 items-center gap-1.5 text-xs';
          const label = document.createElement('span'); label.className = 'truncate font-medium'; label.textContent = 'ZCode Start Plan';
          const badge = document.createElement('span'); badge.className = 'shrink-0 rounded-sm bg-sidebar-border/60 px-1 py-0.5 text-2xs leading-none text-subtle-foreground'; badge.textContent = data?.planLabel ?? 'Start Plan';
          head.append(label, badge); section.append(head);
          if (data?.status === 'ok' && data.windows?.length) for (const w of data.windows) {
            const name = document.createElement('span'); name.className = 'text-xs text-muted-foreground'; name.textContent = w.label;
            const track = document.createElement('div'); track.className = 'my-auto h-1.5 min-w-8 overflow-hidden rounded-full bg-sidebar-border';
            const fill = document.createElement('div'); fill.className = 'h-full rounded-full bg-primary'; fill.style.width = `${Math.min(100, Math.max(0, w.usedPercent))}%`; track.append(fill);
            const value = document.createElement('span'); value.className = 'text-xs text-muted-foreground'; value.textContent = `${Math.round(w.usedPercent * 10) / 10}%`;
            const reset = document.createElement('span'); reset.className = 'text-xs text-muted-foreground'; reset.textContent = w.resetsAt ? new Date(w.resetsAt).toLocaleDateString(undefined, {day:'numeric',month:'short'}) : '—';
            section.append(name, track, value, reset);
          } else { const note = document.createElement('span'); note.className = 'col-span-full text-xs text-muted-foreground'; note.textContent = 'Лимит недоступен'; section.append(note); }
          wrap.append(section); list.append(wrap); continue;
        }
        if (!list.classList.contains('divide-y')) continue;
        const wrap = document.createElement('div');
        wrap.dataset.zcodeStartUsage = 'true';
        wrap.className = 'py-3.5 first:pt-0 last:pb-0';
        const section = document.createElement('section');
        section.className = 'space-y-3.5 py-3.5 first:pt-0 last:pb-0';
        const title = document.createElement('div');
        title.className = 'flex items-start justify-between gap-2';
        const name = document.createElement('span');
        name.className = 'text-sm font-medium';
        name.textContent = 'ZCode Start Plan';
        const plan = document.createElement('span');
        plan.className = 'shrink-0 rounded-sm border border-border bg-muted/40 px-1.5 py-0.5 text-2xs leading-none text-subtle-foreground';
        plan.textContent = data?.planLabel ?? 'Start Plan';
        title.append(name, plan); section.append(title);
        if (!data || data.status !== 'ok' || !data.windows?.length) {
          const note = document.createElement('div'); note.className = 'text-xs text-muted-foreground'; note.textContent = 'Лимит недоступен'; section.append(note);
        } else for (const w of data.windows) {
          const text = document.createElement('div'); text.className = 'text-xs text-muted-foreground flex justify-between gap-2';
          const label = document.createElement('span'); label.textContent = w.label;
          const value = document.createElement('span'); value.textContent = `${Math.round(w.usedPercent * 10) / 10}% used`; text.append(label, value); section.append(text);
          const track = document.createElement('div'); track.className = 'h-1.5 overflow-hidden rounded-full bg-muted';
          const fill = document.createElement('div'); fill.className = 'h-full rounded-full bg-primary'; fill.style.width = `${Math.min(100, Math.max(0, w.usedPercent))}%`; track.append(fill); section.append(track);
          if (w.resetsAt) { const reset = document.createElement('div'); reset.className = 'text-xs text-muted-foreground'; reset.textContent = `До ${new Date(w.resetsAt).toLocaleString()}`; section.append(reset); }
        }
        wrap.append(section); list.append(wrap);
      }
    };
    const refresh = async () => {
      if (pending || disposed) return; pending = true;
      try { const response = await fetch('/api/v1/plugins/zcode-start-usage/rpc/usage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'null', signal }); const result = await response.json(); data = result.ok ? result.result : null; }
      catch { data = null; }
      finally { pending = false; if (!disposed) { document.querySelectorAll('[data-zcode-start-usage]').forEach(e => e.remove()); draw(); } }
    };
    const observer = new MutationObserver(draw); observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(refresh, 60000); void refresh();
    return () => { disposed = true; observer.disconnect(); clearInterval(timer); document.querySelectorAll('[data-zcode-start-usage]').forEach(e => e.remove()); };
  }});
});
