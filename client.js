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
 *     later from newly installed plugins,
 *   - custom entries: give any installed plugin an icon of its own (a text
 *     glyph, since packages cannot ship their svg here) in the top panel list
 *     or in the footer row. A panel entry registers its own `main` occupant
 *     that redirects to the plugin's page through `pluginNavigation`, because a
 *     panel row has to select a panel id it does not own.
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
${sel(' button span:not(:has(svg)):not(.sir-glyph)')},
${sel(' .dshdr-foot-label')}{
  display: none !important;
}

/* ===== custom entries (pins): a text glyph instead of an icon ===== */
.sir-glyph{
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: none !important;
  line-height: 1 !important;
  font-weight: 600 !important;
  font-family: inherit !important;
  letter-spacing: 0 !important;
  color: inherit !important;
  user-select: none !important;
  white-space: nowrap !important;
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

/* A custom entry fills the square so the whole tile is its click target. */
[class*="panelRow"] [class*="panelGlyph"]:has([data-sir-pin]){
  width: 100% !important;
  height: 100% !important;
}

[data-sir-pin]{
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  cursor: pointer !important;
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

    /** Keys of custom entries carry this prefix so they never collide with a
     * plugin's own entry that happens to use the same label. */
    const PIN_PREFIX = 'pin:';
    const PIN_ORDER_BASE = 40;
    const MAX_GLYPH = 2;

    function normalizePins(value) {
      if (!Array.isArray(value)) return [];
      const pins = [];
      for (const item of value) {
        if (!item || typeof item.name !== 'string' || !item.name) continue;
        const label =
          typeof item.label === 'string' && item.label.trim() ? item.label.trim() : item.name;
        pins.push({
          name: item.name,
          label,
          glyph: typeof item.glyph === 'string' ? item.glyph.slice(0, MAX_GLYPH) : '',
          region: item.region === 'panel' ? 'panel' : 'footer',
        });
      }
      return pins;
    }

    function readSettings() {
      const fallback = { size: DEFAULT_SIZE, hidden: {}, order: [], pins: [] };
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        const size = SIZES.indexOf(parsed && parsed.size) >= 0 ? parsed.size : DEFAULT_SIZE;
        const hidden =
          parsed && parsed.hidden && typeof parsed.hidden === 'object' ? parsed.hidden : {};
        const order =
          parsed && Array.isArray(parsed.order)
            ? parsed.order.filter((key) => typeof key === 'string')
            : [];
        const pins = normalizePins(parsed && parsed.pins);
        return { size, hidden, order, pins };
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
     * Order
     * ------------------------------------------------------------------ */

    /** Keys of one container, in discovery order. Custom entries are managed in
     * their own section, so they stay out of the plugin entry lists. */
    function groupKeys(group) {
      return Array.from(discovered.entries())
        .filter(([key, meta]) => meta.group === group && !isPinKey(key))
        .map(([key]) => key);
    }

    /**
     * Keys of one container in their current visual order. Entries the user has
     * not reordered yet sort after the ordered ones, in discovery order.
     */
    function effectiveOrder(group) {
      const ranked = groupKeys(group).map((key, index) => {
        const position = settings.order.indexOf(key);
        return { key, rank: position >= 0 ? position : 1000 + index };
      });
      ranked.sort((a, b) => a.rank - b.rank);
      return ranked.map((entry) => entry.key);
    }

    /** Swap one entry with its neighbour inside its own container. */
    function moveEntry(key, group, delta) {
      const keys = effectiveOrder(group);
      const index = keys.indexOf(key);
      const next = index + delta;
      if (index < 0 || next < 0 || next >= keys.length) return;
      const swapped = keys.slice();
      swapped[index] = keys[next];
      swapped[next] = keys[index];
      const panel = group === 'panel' ? swapped : effectiveOrder('panel');
      const footer = group === 'footer' ? swapped : effectiveOrder('footer');
      settings.order = panel.concat(footer);
      persist();
      scan();
    }

    function resetOrder() {
      settings.order = [];
      persist();
      scan();
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
      /* A custom entry carries its own stable key, so it never shares state
         with a plugin entry that happens to use the same label. */
      const hint = String((el.getAttribute && el.getAttribute('data-sir-key-hint')) || '').trim();
      if (hint) {
        const text = aria || String((button && button.textContent) || el.textContent || '').trim();
        return { key: hint, label: aria || text || hint };
      }
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
      let natural = 0;
      for (const { el, group } of entryNodes()) {
        const { key, label } = describe(el);
        const previous = discovered.get(key);
        if (!previous || previous.label !== label || previous.group !== group) {
          discovered.set(key, { label, group });
          changed = true;
        }
        seen.add(key);
        el.setAttribute('data-sir-key', key);

        const position = settings.order.indexOf(key);
        if (settings.order.length === 0) {
          el.style.removeProperty('order');
        } else {
          el.style.setProperty('order', String(position >= 0 ? position : 1000 + natural));
        }
        natural += 1;

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
     * Custom entries: an icon for any installed plugin, top or bottom
     * ------------------------------------------------------------------ */

    /** Set by `apply`; slot and remote services are needed from the view. */
    let pluginCtx = null;

    const isPinKey = (key) => String(key).startsWith(PIN_PREFIX);

    /** First character of a label, used when the user typed no glyph. */
    function defaultGlyph(label) {
      const text = String(label || '').trim();
      const chars = Array.from(text);
      return chars.length > 0 ? chars[0] : '?';
    }

    /** Strip the registry scope from a package name: `@local/x` becomes `x`. */
    function shortName(name) {
      const text = String(name || '');
      const slash = text.lastIndexOf('/');
      return slash >= 0 ? text.slice(slash + 1) : text;
    }

    /**
     * Open an installed plugin's page in the plugin manager.
     *
     * `pluginNavigation.openBundle` selects the Plugins panel and shows that
     * bundle, which works for every installed plugin whether or not it ships a
     * sidebar entry of its own.
     */
    function openBundle(name) {
      const ctx = pluginCtx;
      if (!ctx) return false;
      let nav = null;
      try {
        nav = typeof ctx.get === 'function' ? ctx.get('pluginNavigation') : null;
      } catch {
        /* the plugin manager bundle is not running; fall back below */
      }
      if (nav && typeof nav.openBundle === 'function') {
        try {
          nav.openBundle(name);
          return true;
        } catch {
          /* fall through to the list */
        }
      }
      if (nav && typeof nav.openList === 'function') {
        try {
          nav.openList();
          return true;
        } catch {
          /* nothing else to try */
        }
      }
      try {
        if (ctx.layout && typeof ctx.layout.selectPanel === 'function') {
          ctx.layout.selectPanel('plugins');
          return true;
        }
      } catch {
        /* no layout service either */
      }
      return false;
    }

    function PinGlyph(props) {
      const pin = props.pin;
      const text = pin.glyph || defaultGlyph(pin.label);
      const width = Array.from(text).length > 1 ? 0.6 : 0.82;
      return h(
        'span',
        {
          className: 'sir-glyph',
          style: { fontSize: `${Math.round(settings.size * width)}px` },
          'aria-hidden': 'true',
        },
        text,
      );
    }

    function FooterPin(props) {
      const pin = props.pin;
      return h(
        'div',
        { 'data-sir-key-hint': PIN_PREFIX + pin.name },
        h(
          'button',
          {
            type: 'button',
            'aria-label': pin.label,
            onClick: () => openBundle(pin.name),
          },
          h(PinGlyph, { pin }),
        ),
      );
    }

    function PanelPin(props) {
      const pin = props.pin;
      const ref = React.useRef(null);
      React.useLayoutEffect(() => {
        const node = ref.current;
        const row = node && node.closest ? node.closest('[class*="panelRow"]') : null;
        if (!row) return undefined;
        row.setAttribute('data-sir-key-hint', PIN_PREFIX + pin.name);
        return () => {
          row.removeAttribute('data-sir-key-hint');
        };
      }, [pin.name]);
      /* The row would select a panel id this entry does not own. Open the
         plugin's own page instead and keep the current panel selection. */
      const onClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        openBundle(pin.name);
      };
      return h(
        'span',
        { ref, 'data-sir-pin': pin.name, role: 'presentation', onClick },
        h(PinGlyph, { pin }),
      );
    }

    /** A top entry selects its own panel id; this occupant redirects at once. */
    function PinOpener(props) {
      const name = props.pin.name;
      React.useEffect(() => {
        openBundle(name);
      }, [name]);
      return null;
    }

    let pinDisposers = [];

    function disposePins() {
      for (const dispose of pinDisposers) {
        try {
          if (typeof dispose === 'function') dispose();
        } catch {
          /* already gone */
        }
      }
      pinDisposers = [];
    }

    /** Re-register one slot entry per pin, in the region it was placed in. */
    function reloadPins() {
      disposePins();
      const ctx = pluginCtx;
      if (!ctx || !ctx.slots) return;
      /** Register one slot contribution; a failure must not break the others. */
      const own = (slot, register) => {
        try {
          const dispose = ctx.slots.inject(slot, register);
          if (typeof dispose === 'function') pinDisposers.push(dispose);
        } catch {
          /* the slot is not declared in this shell build */
        }
      };
      settings.pins.forEach((pin, index) => {
        const id = `sir-pin-${index}`;
        const shared = { label: pin.label, order: PIN_ORDER_BASE + index, inject: () => ({ pin }) };
        if (pin.region === 'panel') {
          own('sidebar.panellist', () =>
            ctx.slots.register(Object.assign({ name: 'sidebar.panellist', id }, shared), PanelPin),
          );
          own('main', () =>
            ctx.slots.register({ name: 'main', key: id, inject: () => ({ pin }) }, PinOpener),
          );
        } else {
          own('sidebar.footer.action', () =>
            ctx.slots.register(
              Object.assign({ name: 'sidebar.footer.action', id }, shared),
              FooterPin,
            ),
          );
        }
      });
    }

    /** Mutate the pin list, then persist; the subscription re-registers. */
    function commitPins(next) {
      settings.pins = next;
      persist();
      scan();
    }

    function addPin(name, glyph, region) {
      const existing = settings.pins.find((pin) => pin.name === name);
      if (existing) return;
      const label = (pinLabels.get(name) || shortName(name)).trim();
      const pins = settings.pins.concat([
        { name, label, glyph: String(glyph || '').slice(0, MAX_GLYPH), region },
      ]);
      commitPins(pins);
    }

    function removePin(index) {
      commitPins(settings.pins.filter((_, position) => position !== index));
    }

    function setPinRegion(index, region) {
      commitPins(
        settings.pins.map((pin, position) =>
          position === index ? Object.assign({}, pin, { region }) : pin,
        ),
      );
    }

    function setPinGlyph(index, glyph) {
      commitPins(
        settings.pins.map((pin, position) =>
          position === index ? Object.assign({}, pin, { glyph: glyph.slice(0, MAX_GLYPH) }) : pin,
        ),
      );
    }

    function movePin(index, delta) {
      const next = index + delta;
      if (index < 0 || next < 0 || next >= settings.pins.length) return;
      const pins = settings.pins.slice();
      const held = pins[index];
      pins[index] = pins[next];
      pins[next] = held;
      commitPins(pins);
    }

    /** name -> readable title, learned when the installed plugin list loads. */
    const pinLabels = new Map();

    async function loadInstalledPlugins() {
      const ctx = pluginCtx;
      const manager = ctx && ctx.remote ? ctx.remote.pluginManager : null;
      if (!manager || typeof manager.listBundles !== 'function') return [];
      try {
        const answer = await manager.listBundles();
        if (!answer || answer.ok !== true || !Array.isArray(answer.value)) return [];
        return answer.value
          .filter((bundle) => bundle && typeof bundle.name === 'string' && bundle.installed !== false)
          .map((bundle) => {
            /* meta.title may be a locale reference, not text; only keep strings. */
            const declared = bundle.meta && bundle.meta.title;
            const title = typeof declared === 'string' && declared ? declared : shortName(bundle.name);
            return { name: bundle.name, title, version: bundle.version };
          })
          .sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
      } catch {
        return [];
      }
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

    function arrowButton(glyph, enabled, onClick, ariaLabel) {
      return h(
        'button',
        {
          type: 'button',
          'aria-label': ariaLabel,
          disabled: !enabled,
          onClick,
          style: {
            flex: 'none',
            width: '24px',
            height: '24px',
            padding: 0,
            borderRadius: '6px',
            border: '1px solid var(--dsw-alias-border-l2, #e2e4e8)',
            background: 'transparent',
            color: 'var(--dsw-alias-label-secondary, #6b7280)',
            cursor: enabled ? 'pointer' : 'default',
            opacity: enabled ? 1 : 0.35,
            fontSize: '12px',
            lineHeight: '20px',
          },
        },
        glyph,
      );
    }

    function entryRow(key, label, group, canUp, canDown) {
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
          'span',
          { style: { display: 'flex', gap: '4px', flex: 'none' } },
          arrowButton('↑', canUp, () => moveEntry(key, group, -1), `${label} 上移`),
          arrowButton('↓', canDown, () => moveEntry(key, group, 1), `${label} 下移`),
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

    const selectStyle = {
      minWidth: 0,
      flex: '1 1 160px',
      height: '32px',
      padding: '0 8px',
      borderRadius: '8px',
      border: '1px solid var(--dsw-alias-border-l2, #e2e4e8)',
      background: 'var(--dsw-alias-bg-layer-2, #ffffff)',
      color: 'var(--dsw-alias-label-primary, #17191c)',
      font: 'inherit',
      fontSize: '13px',
    };

    const inputStyle = {
      flex: 'none',
      width: '52px',
      height: '32px',
      padding: '0 6px',
      borderRadius: '8px',
      border: '1px solid var(--dsw-alias-border-l2, #e2e4e8)',
      background: 'transparent',
      color: 'var(--dsw-alias-label-primary, #17191c)',
      font: 'inherit',
      fontSize: '13px',
      textAlign: 'center',
    };

    function chipButton(label, active, onClick) {
      return h(
        'button',
        {
          type: 'button',
          'aria-pressed': active ? 'true' : 'false',
          onClick,
          style: {
            flex: 'none',
            height: '32px',
            padding: '0 10px',
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
        label,
      );
    }

    function pinRow(pin, index, total) {
      const preview = pin.glyph || defaultGlyph(pin.label);
      return h(
        'div',
        {
          key: `${pin.name}-${index}`,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
            padding: '6px 0',
          },
        },
        h(
          'span',
          {
            style: {
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'var(--dsw-alias-interactive-bg-hover, #eceff4)',
              fontSize: Array.from(preview).length > 1 ? '10px' : '13px',
              fontWeight: 600,
              lineHeight: 1,
            },
          },
          preview,
        ),
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
            title: pin.name,
          },
          pin.label,
        ),
        h(
          'input',
          {
            style: Object.assign({}, inputStyle, { width: '46px', height: '24px' }),
            value: pin.glyph,
            placeholder: defaultGlyph(pin.label),
            maxLength: MAX_GLYPH,
            'aria-label': `${pin.label} 图标字符`,
            onChange: (event) => setPinGlyph(index, event.target.value),
          },
        ),
        h(
          'span',
          { style: { display: 'flex', gap: '4px', flex: 'none' } },
          chipButton('上排', pin.region === 'panel', () =>
            setPinRegion(index, pin.region === 'panel' ? 'footer' : 'panel'),
          ),
          arrowButton('↑', index > 0, () => movePin(index, -1), `${pin.label} 上移`),
          arrowButton('↓', index < total - 1, () => movePin(index, 1), `${pin.label} 下移`),
        ),
        h(
          'button',
          {
            type: 'button',
            'aria-label': `删除 ${pin.label}`,
            onClick: () => removePin(index),
            style: {
              flex: 'none',
              height: '24px',
              padding: '0 6px',
              border: 0,
              background: 'transparent',
              color: 'var(--dsw-alias-label-tertiary, #8b9098)',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: '12px',
            },
          },
          '删除',
        ),
      );
    }

    function ConfigView(props) {
      const [, bump] = React.useState(0);
      const [bundles, setBundles] = React.useState(null);
      const [pick, setPick] = React.useState('');
      const [glyphDraft, setGlyphDraft] = React.useState('');
      const [region, setRegion] = React.useState('footer');
      React.useEffect(() => {
        const off = subscribe(() => bump((value) => value + 1));
        scan();
        return off;
      }, []);
      React.useEffect(() => {
        let alive = true;
        loadInstalledPlugins().then((list) => {
          if (!alive) return;
          for (const item of list) pinLabels.set(item.name, item.title);
          setBundles(list);
          setPick((current) => current || (list.length > 0 ? list[0].name : ''));
        });
        return () => {
          alive = false;
        };
      }, []);

      const entries = Array.from(discovered.entries()).filter(([key]) => !isPinKey(key));
      if (props && props.view === 'summary') {
        const shown = entries.filter(([key]) => !settings.hidden[key]).length;
        return h(
          'span',
          { style: { color: 'var(--dsw-alias-label-secondary, #6b7280)', fontSize: '12px' } },
          `${settings.size}px · ${shown}/${entries.length} 个图标显示`,
        );
      }

      const grouped = [
        ['panel', effectiveOrder('panel')],
        ['footer', effectiveOrder('footer')],
      ];

      const picked = bundles ? bundles.find((item) => item.name === pick) : null;
      const pickedTitle = picked ? picked.title : '';

      const customSection = h(
        'div',
        null,
        h('div', { style: sectionTitleStyle }, `自定义入口（${settings.pins.length}）`),
        h(
          'div',
          { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
          h(
            'select',
            {
              style: selectStyle,
              value: pick,
              'aria-label': '选择已安装的插件',
              onChange: (event) => setPick(event.target.value),
            },
            bundles === null
              ? h('option', { value: '' }, '正在读取已安装插件…')
              : bundles.length === 0
                ? h('option', { value: '' }, '没有读到已安装的插件')
                : bundles.map((item) =>
                    h('option', { key: item.name, value: item.name }, item.title),
                  ),
          ),
          h('input', {
            style: inputStyle,
            value: glyphDraft,
            maxLength: MAX_GLYPH,
            placeholder: pickedTitle ? defaultGlyph(pickedTitle) : '图标',
            'aria-label': '图标字符',
            onChange: (event) => setGlyphDraft(event.target.value),
          }),
          chipButton('上排', region === 'panel', () => setRegion('panel')),
          chipButton('下排', region === 'footer', () => setRegion('footer')),
          h(
            'button',
            {
              type: 'button',
              disabled: !pick,
              onClick: () => {
                if (!pick) return;
                addPin(pick, glyphDraft, region);
                setGlyphDraft('');
              },
              style: {
                flex: 'none',
                height: '32px',
                padding: '0 14px',
                borderRadius: '8px',
                border: 0,
                cursor: pick ? 'pointer' : 'default',
                font: 'inherit',
                fontSize: '13px',
                fontWeight: 500,
                color: '#ffffff',
                background: pick
                  ? 'var(--dsw-alias-state-business-primary, #1f6feb)'
                  : 'var(--dsw-alias-interactive-bg-hover, #d8dbe0)',
              },
            },
            '添加',
          ),
        ),
        settings.pins.length === 0
          ? h(
              'div',
              { style: Object.assign({}, hintStyle, { marginTop: '8px' }) },
              '选一个已安装的插件，指定上排或下排，点「添加」即可在侧栏得到一个图标；图标字符留空时取插件名首字。',
            )
          : h(
              'div',
              { style: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' } },
              settings.pins.map((pin, index) => pinRow(pin, index, settings.pins.length)),
            ),
      );

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
        customSection,
        ...grouped.map(([group, keys]) =>
          h(
            'div',
            { key: group },
            h('div', { style: sectionTitleStyle }, `${GROUPS[group]}（${keys.length}）`),
            keys.length === 0
              ? h('div', { style: hintStyle }, '没有检测到入口。')
              : h(
                  'div',
                  { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                  keys.map((key, index) => {
                    const meta = discovered.get(key);
                    return entryRow(
                      key,
                      meta ? meta.label : key,
                      group,
                      index > 0,
                      index < keys.length - 1,
                    );
                  }),
                ),
          ),
        ),
        h(
          'div',
          { style: hintStyle },
          '关闭的入口会从侧栏隐藏，插件本身不受影响；上下箭头调整图标在侧栏里的先后顺序；新安装的插件默认出现在末尾并保持显示。',
        ),
        settings.order.length > 0
          ? h(
              'button',
              {
                type: 'button',
                onClick: resetOrder,
                style: {
                  alignSelf: 'flex-start',
                  padding: 0,
                  border: 0,
                  background: 'transparent',
                  color: 'var(--dsw-alias-label-secondary, #6b7280)',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: '12px',
                  textDecoration: 'underline',
                },
              },
              '重置图标顺序',
            )
          : null,
      );
    }

    /* ------------------------------------------------------------------ *
     * Settings entry (sidebar.footer.action)
     * ------------------------------------------------------------------ */

    function GearIcon() {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: 16,
          height: 16,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
        h('circle', { cx: 12, cy: 12, r: 3 }),
        h('path', {
          d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
        }),
      );
    }

    function isVisible(el) {
      return Boolean(el) && el.getClientRects().length > 0;
    }

    /** The account menu renders "设置" plus the shortcut hint as one row. */
    function findSettingsMenuItem() {
      const nodes = Array.from(document.querySelectorAll('button, [role="menuitem"], a'));
      return (
        nodes.find((el) => {
          if (!isVisible(el)) return false;
          const text = String(el.textContent || '').replace(/\s+/g, '');
          return text.startsWith('设置') && text.length <= 12;
        }) || null
      );
    }

    /** The settings shell renders a stable modal marker. */
    function settingsOpen() {
      return Boolean(document.querySelector('[data-shortcut-modal="settings"]'));
    }

    /** Ctrl+, is the shipped `settings.open` binding. */
    function pressSettingsShortcut() {
      try {
        document.body.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: ',',
            code: 'Comma',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
            composed: true,
          }),
        );
      } catch {
        /* no keyboard events: the menu fallback below still applies */
      }
    }

    function openSettingsFromMenu() {
      const item = findSettingsMenuItem();
      if (item) {
        item.click();
        return;
      }
      const row = document.querySelector('[class*="triggerRow"]');
      const trigger = row ? row.querySelector('button') : null;
      if (!trigger) return;
      const label = String(trigger.getAttribute('aria-label') || trigger.textContent || '')
        .replace(/\s+/g, '')
        .trim();
      trigger.click();
      /* A bare settings row (no launcher occupant) opens Settings itself. */
      if (label.startsWith('设置')) return;
      window.setTimeout(() => {
        const late = findSettingsMenuItem();
        if (late) late.click();
      }, 200);
    }

    /**
     * Open Settings without owning the shell.
     *
     * The settings seat is a single slot held by the account menu and the shell
     * exposes no open action to outside plugins. The shipped shortcut opens it
     * directly; when the binding was remapped, fall back to the account menu.
     */
    function openSettings() {
      if (settingsOpen()) return;
      pressSettingsShortcut();
      window.setTimeout(() => {
        if (settingsOpen()) return;
        openSettingsFromMenu();
      }, 140);
    }

    function SettingsEntry() {
      return h(
        'div',
        null,
        h(
          'button',
          {
            type: 'button',
            'aria-label': '设置',
            onClick: openSettings,
          },
          h(GearIcon),
        ),
      );
    }

    let pinSignature = '';

    /** Cheap guard so unrelated settings changes never re-register entries. */
    function reloadPinsIfChanged() {
      const signature = JSON.stringify(settings.pins);
      if (signature === pinSignature) return;
      pinSignature = signature;
      reloadPins();
    }

    /* ------------------------------------------------------------------ *
     * Plugin
     * ------------------------------------------------------------------ */

    return {
      inject: ['slots', 'layout', 'remote', 'remote.pluginManager'],
      apply(ctx) {
        pluginCtx = ctx;
        pinSignature = '';
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

        ctx.effect(
          () => {
            reloadPinsIfChanged();
            const off = subscribe(reloadPinsIfChanged);
            return () => {
              off();
              disposePins();
            };
          },
          'sidebarIconRow.pins',
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

        ctx.slots.inject('sidebar.footer.action', () =>
          ctx.slots.register(
            {
              name: 'sidebar.footer.action',
              id: 'settings-entry',
              order: 1,
              label: '设置',
            },
            SettingsEntry,
          ),
        );
      },
    };
  },
});
