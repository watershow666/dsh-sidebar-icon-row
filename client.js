/**
 * Client half of `dsh-sidebar-icon-row`.
 *
 * Two sidebar regions render contributions as full-width action rows:
 * `sidebar.panellist` (panel entries above the session tree) and
 * `sidebar.footer.action` (the foot). This module turns both into rows of
 * icon-only squares and gives the user two controls:
 *
 *   - icon size (16 / 18 / 20 / 24 px, the square follows),
 *   - one show/hide switch per discovered entry, including entries that appear
 *     later from newly installed plugins.
 *
 * Settings live in localStorage; entries are discovered from the live DOM and
 * tagged with `data-sir-key` / `data-sir-off`, so hiding one never rewrites the
 * plugin that owns it. Nothing is registered outside the bundle's own
 * `plugins.bundle.config` cell and one stylesheet node.
 */
window.__ModuleLoader__.load({
  id: 'dsh-sidebar-icon-row',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const STYLE_ID = 'sidebar-icon-row-style';
    const STORE_KEY = 'dsh.sidebar-icon-row.v1';
    const SIZES = [16, 18, 20, 24];
    const DEFAULT_SIZE = 18;

    /* ------------------------------------------------------------------ *
     * Stylesheet
     * ------------------------------------------------------------------ */

    /*
     * The two entry selectors are complementary: when the renderer wraps list
     * items in a `display: contents` anchor, the entries are children of that
     * anchor; otherwise they sit directly in the footer container.
     */
    const ENTRY = [
      '[data-slot="sidebar.footer.action"] > *:not(.cm-footer-stack):not(:has(.cm-footer-stack))',
      '[class*="footerActions"] > *:not([data-slot]):not(.cm-footer-stack):not(:has(.cm-footer-stack))',
    ];
    const sel = (suffix) => ENTRY.map((entry) => entry + suffix).join(',\n');

    const CSS = `
/* sidebar-icon-row: entries as icon squares, sized by --sir-icon/--sir-square. */
[class*="footerActions"]{
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 8px !important;
}

/* The cost card keeps a full row of its own. */
[class*="footerActions"] .cm-footer-stack{
  flex: 0 0 100% !important;
  width: 100% !important;
}

${sel('')}{
  flex: 0 0 auto !important;
  width: var(--sir-square, 36px) !important;
  min-width: 0 !important;
  max-width: var(--sir-square, 36px) !important;
  height: var(--sir-square, 36px) !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: visible !important;
  border-radius: var(--dsw-radius-md, 8px) !important;
  background: transparent !important;
}

${sel(' button')}{
  box-sizing: border-box !important;
  width: var(--sir-square, 36px) !important;
  min-width: 0 !important;
  max-width: var(--sir-square, 36px) !important;
  height: var(--sir-square, 36px) !important;
  min-height: 0 !important;
  max-height: var(--sir-square, 36px) !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 !important;
  border: 0 !important;
  /* Entries ship their own overflow: hidden, which would clip the tooltip. */
  overflow: visible !important;
  border-radius: var(--dsw-radius-md, 8px) !important;
  background: transparent !important;
  box-shadow: none !important;
  color: var(--dsw-alias-label-primary, inherit) !important;
}

${sel(' svg')}{
  width: var(--sir-icon, 18px) !important;
  height: var(--sir-icon, 18px) !important;
  flex: none !important;
  display: block !important;
}

/* Hide the constant label; keep the accessible name on the button. */
${sel(' button span:not(:has(svg))')},
${sel(' .dshdr-foot-label')}{
  display: none !important;
}

${sel(':hover')}{
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06)) !important;
}

/* Name on hover, without JS: the buttons already carry aria-label. */
${sel(' button[aria-label]')}{
  position: relative !important;
}

${sel(' button[aria-label]::after')}{
  content: attr(aria-label);
  position: absolute;
  left: 0;
  bottom: calc(100% + 6px);
  z-index: 60;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l2, #e2e4e8);
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: var(--dsw-alias-label-primary, #17191c);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease 0.3s;
}

${sel(' button[aria-label]:hover::after')}{
  opacity: 1;
}

/* ===== sidebar.panellist: the same treatment for panel entries ===== */
[class*="panelList"]{
  flex-direction: row !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 8px !important;
  margin-bottom: 8px !important;
}

[class*="panelRow"]{
  flex: 0 0 auto !important;
  width: var(--sir-square, 36px) !important;
  min-width: 0 !important;
  max-width: var(--sir-square, 36px) !important;
  height: var(--sir-square, 36px) !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  gap: 0 !important;
  justify-content: center !important;
  border-radius: var(--dsw-radius-md, 8px) !important;
  overflow: visible !important;
}

[class*="panelRow"] [class*="panelTitle"]{
  display: none !important;
}

[class*="panelRow"] [class*="panelGlyph"] svg{
  width: var(--sir-icon, 18px) !important;
  height: var(--sir-icon, 18px) !important;
}

[class*="panelRow"][aria-label]{
  position: relative !important;
}

[class*="panelRow"][aria-label]::after{
  content: attr(aria-label);
  position: absolute;
  left: 0;
  bottom: calc(100% + 6px);
  z-index: 60;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l2, #e2e4e8);
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: var(--dsw-alias-label-primary, #17191c);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease 0.3s;
}

[class*="panelRow"][aria-label]:hover::after{
  opacity: 1;
}

/* Collapsed rail: keep the shipped one-icon-per-line spacing. */
[class*="_collapsed"] [class*="footerActions"]{
  flex-wrap: nowrap !important;
  gap: 4px !important;
}

[class*="_collapsed"] [class*="panelList"]{
  flex-direction: column !important;
  flex-wrap: nowrap !important;
  gap: 12px !important;
  margin-bottom: 12px !important;
}

/* Entries the user switched off. Reuse the entry selector so this beats the
   display: flex !important declared above, and keep the rule last. */
${sel('[data-sir-off="1"]')},
[class*="panelList"] > *[data-sir-off="1"]{
  display: none !important;
}
`;

    /* ------------------------------------------------------------------ *
     * Settings
     * ------------------------------------------------------------------ */

    function readSettings() {
      const fallback = { size: DEFAULT_SIZE, hidden: {} };
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        const size = SIZES.indexOf(parsed && parsed.size) >= 0 ? parsed.size : DEFAULT_SIZE;
        const hidden =
          parsed && parsed.hidden && typeof parsed.hidden === 'object' ? parsed.hidden : {};
        return { size, hidden };
      } catch {
        return fallback;
      }
    }

    let settings = readSettings();
    const listeners = new Set();

    function notify() {
      for (const listener of Array.from(listeners)) {
        try {
          listener();
        } catch {
          /* a stale page listener must not break discovery */
        }
      }
    }

    function persist() {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(settings));
      } catch {
        /* private mode: keep the in-memory value */
      }
      notify();
    }

    function subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }

    function applyTokens() {
      const root = document.documentElement;
      root.style.setProperty('--sir-icon', `${settings.size}px`);
      root.style.setProperty('--sir-square', `${settings.size + 18}px`);
    }

    /* ------------------------------------------------------------------ *
     * Discovery
     * ------------------------------------------------------------------ */

    /** key -> { label, group } for every sidebar entry currently mounted. */
    const discovered = new Map();

    const GROUPS = { panel: '面板入口', footer: '底部入口' };

    function isCostCard(el) {
      return el.classList.contains('cm-footer-stack') || Boolean(el.querySelector('.cm-footer-stack'));
    }

    function entryNodes() {
      const nodes = [];
      const anchors = document.querySelectorAll('[data-slot="sidebar.footer.action"]');
      if (anchors.length > 0) {
        for (const anchor of anchors) {
          for (const el of anchor.children) nodes.push({ el, group: 'footer' });
        }
      } else {
        for (const box of document.querySelectorAll('[class*="footerActions"]')) {
          for (const el of box.children) nodes.push({ el, group: 'footer' });
        }
      }
      for (const nav of document.querySelectorAll('[class*="panelList"]')) {
        for (const el of nav.children) nodes.push({ el, group: 'panel' });
      }
      return nodes.filter(
        ({ el }) => el.nodeType === 1 && !isCostCard(el) && el.tagName !== 'SCRIPT',
      );
    }

    function describe(el) {
      const button = el.tagName === 'BUTTON' ? el : el.querySelector('button');
      const aria = String(
        (el.getAttribute && el.getAttribute('aria-label')) ||
          (button && button.getAttribute('aria-label')) ||
          '',
      ).trim();
      if (aria) return { key: aria, label: aria };
      const text = String(el.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) {
        const label = text.slice(0, 48);
        return { key: label, label };
      }
      const token = String(el.className || '')
        .split(/\s+/)
        .filter(Boolean)[0] || el.tagName.toLowerCase();
      return { key: token, label: token };
    }

    function scan() {
      if (typeof document === 'undefined') return;
      applyTokens();
      let changed = false;
      const seen = new Set();
      for (const { el, group } of entryNodes()) {
        const { key, label } = describe(el);
        const previous = discovered.get(key);
        if (!previous || previous.label !== label || previous.group !== group) {
          discovered.set(key, { label, group });
          changed = true;
        }
        seen.add(key);
        el.setAttribute('data-sir-key', key);
        const wasOff = el.getAttribute('data-sir-off') === '1';
        if (settings.hidden[key]) {
          el.setAttribute('data-sir-off', '1');
          /* Inline !important wins over the entry rule's display:flex !important,
             so hiding never depends on selector order. */
          el.style.setProperty('display', 'none', 'important');
        } else {
          if (wasOff) el.style.removeProperty('display');
          el.removeAttribute('data-sir-off');
        }
      }
      for (const key of Array.from(discovered.keys())) {
        if (!seen.has(key)) {
          discovered.delete(key);
          changed = true;
        }
      }
      if (changed) notify();
    }

    let timer = 0;
    function scheduleScan() {
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        scan();
      }, 150);
    }

    /* ------------------------------------------------------------------ *
     * Configuration view (plugins.bundle.config, keyed by package name)
     * ------------------------------------------------------------------ */

    const sectionTitleStyle = {
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: 'var(--dsw-alias-label-secondary, #6b7280)',
      margin: '0 0 8px',
    };

    const hintStyle = {
      fontSize: '12px',
      lineHeight: '18px',
      color: 'var(--dsw-alias-label-tertiary, #8b9098)',
    };

    function sizeButton(value) {
      const active = settings.size === value;
      return h(
        'button',
        {
          key: value,
          type: 'button',
          'aria-pressed': active ? 'true' : 'false',
          onClick: () => {
            if (settings.size === value) return;
            settings.size = value;
            applyTokens();
            persist();
          },
          style: {
            minWidth: '56px',
            height: '32px',
            borderRadius: '8px',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: '13px',
            border: active
              ? '1px solid var(--dsw-alias-state-business-primary, #1f6feb)'
              : '1px solid var(--dsw-alias-border-l2, #e2e4e8)',
            background: active
              ? 'var(--dsw-alias-interactive-bg-hover, #eceff4)'
              : 'transparent',
            color: 'var(--dsw-alias-label-primary, inherit)',
          },
        },
        `${value}px`,
      );
    }

    function entryRow(key, label) {
      const on = !settings.hidden[key];
      return h(
        'div',
        {
          key,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: 0,
            padding: '6px 0',
          },
        },
        h(
          'span',
          {
            style: {
              flex: '1 1 auto',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              color: 'var(--dsw-alias-label-primary, inherit)',
            },
          },
          label,
        ),
        h(
          'button',
          {
            type: 'button',
            role: 'switch',
            'aria-checked': on ? 'true' : 'false',
            'aria-label': `${label} 图标`,
            onClick: () => {
              if (settings.hidden[key]) delete settings.hidden[key];
              else settings.hidden[key] = true;
              persist();
              scan();
            },
            style: {
              flex: 'none',
              position: 'relative',
              width: '36px',
              height: '20px',
              padding: 0,
              border: 0,
              borderRadius: '999px',
              cursor: 'pointer',
              background: on
                ? 'var(--dsw-alias-state-business-primary, #1f6feb)'
                : 'var(--dsw-alias-interactive-bg-hover, #d8dbe0)',
              transition: 'background .15s',
            },
          },
          h('span', {
            style: {
              position: 'absolute',
              top: '2px',
              left: on ? '18px' : '2px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              transition: 'left .15s',
            },
          }),
        ),
      );
    }

    function ConfigView(props) {
      const [, bump] = React.useState(0);
      React.useEffect(() => {
        const off = subscribe(() => bump((value) => value + 1));
        scan();
        return off;
      }, []);

      const entries = Array.from(discovered.entries());
      if (props && props.view === 'summary') {
        const shown = entries.filter(([key]) => !settings.hidden[key]).length;
        return h(
          'span',
          { style: { color: 'var(--dsw-alias-label-secondary, #6b7280)', fontSize: '12px' } },
          `${settings.size}px · ${shown}/${entries.length} 个图标显示`,
        );
      }

      const grouped = [
        ['panel', entries.filter(([, meta]) => meta.group === 'panel')],
        ['footer', entries.filter(([, meta]) => meta.group === 'footer')],
      ];

      return h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '18px' } },
        h(
          'div',
          null,
          h('div', { style: sectionTitleStyle }, '图标大小'),
          h(
            'div',
            { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            SIZES.map(sizeButton),
          ),
        ),
        ...grouped.map(([group, items]) =>
          h(
            'div',
            { key: group },
            h('div', { style: sectionTitleStyle }, `${GROUPS[group]}（${items.length}）`),
            items.length === 0
              ? h('div', { style: hintStyle }, '没有检测到入口。')
              : h(
                  'div',
                  { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                  items.map(([key, meta]) => entryRow(key, meta.label)),
                ),
          ),
        ),
        h(
          'div',
          { style: hintStyle },
          '关闭的入口会从侧栏隐藏，插件本身不受影响；新安装的插件会自动出现在上面的列表里，默认显示。',
        ),
      );
    }

    /* ------------------------------------------------------------------ *
     * Plugin
     * ------------------------------------------------------------------ */

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(
          () => {
            if (typeof document === 'undefined') return () => {};
            let node = document.getElementById(STYLE_ID);
            if (!node) {
              node = document.createElement('style');
              node.id = STYLE_ID;
              node.setAttribute('data-plugin-css', 'dsh-sidebar-icon-row');
              document.head.appendChild(node);
            }
            node.textContent = CSS;
            return () => {
              node.remove();
            };
          },
          'sidebarIconRow.styles',
        );

        ctx.effect(
          () => {
            if (typeof document === 'undefined') return () => {};
            applyTokens();
            scan();
            const observer = new MutationObserver(scheduleScan);
            observer.observe(document.body, { childList: true, subtree: true });
            return () => {
              observer.disconnect();
              if (timer) {
                window.clearTimeout(timer);
                timer = 0;
              }
            };
          },
          'sidebarIconRow.discovery',
        );

        ctx.slots.inject('plugins.bundle.config', () =>
          ctx.slots.register(
            {
              name: 'plugins.bundle.config',
              key: 'dsh-sidebar-icon-row',
            },
            ConfigView,
          ),
        );
      },
    };
  },
});
