import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ColorConfig {
  label: string;
  cssVar: string;
  defaultLight: string;
  defaultDark: string;
  category: string;
  group: string;
  hasOpacity?: boolean;
}

// Convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 50, l: 50 };
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Parse color string to get base hex and alpha
function parseColor(color: string): { hex: string; alpha: number } {
  const trimmed = color.trim();

  if (trimmed.startsWith('rgb')) {
    // Supports:
    // - rgb(255, 237, 213)
    // - rgba(120, 53, 15, 0.4)
    // - rgb(100 116 139)
    // - rgb(100 116 139 / 0.12)
    const comma = trimmed.match(
      /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/
    );
    const space = trimmed.match(
      /^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*([\d.]+))?\s*\)$/
    );
    const match = comma ?? space;
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return { hex: `#${r}${g}${b}`, alpha: match[4] ? parseFloat(match[4]) : 1 };
    }
  }

  if (trimmed.startsWith('#')) {
    return { hex: trimmed.slice(0, 7), alpha: 1 };
  }
  return { hex: '#888888', alpha: 1 };
}

// Build color string from hex and alpha
function buildColor(hex: string, alpha: number): string {
  if (alpha >= 1) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

const COLOR_CONFIGS: ColorConfig[] = [
  // === GLOBAL ===
  { category: 'Global', group: 'Page Backgrounds', label: 'VENN Page BG', cssVar: '--page-bg-venn', defaultLight: 'rgba(138, 254, 241, 0.12)', defaultDark: '#000f14' },
  { category: 'Global', group: 'Page Backgrounds', label: 'HERMES Page BG', cssVar: '--page-bg-hermes', defaultLight: 'rgba(241, 214, 218, 0.35)', defaultDark: '#19040b' },
  { category: 'Global', group: 'Page Backgrounds', label: 'AGORA Page BG', cssVar: '--page-bg-agora', defaultLight: '#f1f5f9', defaultDark: '#0a0f1a' },

  { category: 'Global', group: 'Section Containers', label: 'Section Surface', cssVar: '--section-container-bg', defaultLight: 'rgba(255, 255, 255, 0.77)', defaultDark: 'rgba(30,41,59,0.5)', hasOpacity: true },
  { category: 'Global', group: 'Section Containers', label: 'Section Border', cssVar: '--section-container-border', defaultLight: '#e2e8f0', defaultDark: 'rgba(71,85,105,0.5)', hasOpacity: true },
  { category: 'Global', group: 'Section Containers', label: 'Section Title Text', cssVar: '--section-title', defaultLight: '#1e293b', defaultDark: '#f1f5f9' },

  // === VENN ===
  { category: 'VENN', group: 'Headline Cards', label: 'Card Surface', cssVar: '--headline-card-bg', defaultLight: '#cae8e8', defaultDark: 'rgba(13, 24, 28, 0.36)' },
  { category: 'VENN', group: 'Headline Cards', label: 'Card Border', cssVar: '--headline-card-border', defaultLight: 'rgba(167, 243, 208, 0.59)', defaultDark: 'rgba(4, 120, 87, 0.46)', hasOpacity: true },
  { category: 'VENN', group: 'Headline Cards', label: 'Card Text', cssVar: '--headline-card-text', defaultLight: '#064e3b', defaultDark: '#ecfdf5' },
  { category: 'VENN', group: 'Headline Cards', label: 'Card Muted Text', cssVar: '--headline-card-muted', defaultLight: '#059669', defaultDark: '#a7f3d0' },

  { category: 'VENN', group: 'Analysis', label: 'Surface', cssVar: '--analysis-surface', defaultLight: 'rgba(255, 255, 255, 0.53)', defaultDark: 'rgba(13, 48, 41, 0.31)', hasOpacity: true },
  { category: 'VENN', group: 'Analysis', label: 'Label', cssVar: '--analysis-label', defaultLight: '#047857', defaultDark: '#99f6e4' },
  { category: 'VENN', group: 'Analysis', label: 'Text', cssVar: '--analysis-text', defaultLight: '#064e3b', defaultDark: '#f0fdfa' },

  { category: 'VENN', group: 'Bias Table', label: 'Table BG', cssVar: '--bias-table-bg', defaultLight: '#ecfdf5', defaultDark: 'rgba(6,78,59,0.3)', hasOpacity: true },
  { category: 'VENN', group: 'Bias Table', label: 'Row Hover', cssVar: '--bias-row-hover', defaultLight: '#d1fae5', defaultDark: 'rgba(20,184,166,0.2)', hasOpacity: true },

  // === FORUM (HERMES) ===
  { category: 'Forum', group: 'Thread Card', label: 'Card Surface', cssVar: '--thread-surface', defaultLight: '#fdf2f6', defaultDark: 'rgba(39, 12, 23, 0.50)', hasOpacity: true },
  { category: 'Forum', group: 'Thread Card', label: 'Title Text', cssVar: '--thread-title', defaultLight: '#78350f', defaultDark: '#eed7d7' },
  { category: 'Forum', group: 'Thread Card', label: 'Body Text', cssVar: '--thread-text', defaultLight: '#92400e', defaultDark: '#ffffff' },
  { category: 'Forum', group: 'Thread Card', label: 'Meta Text', cssVar: '--thread-muted', defaultLight: '#b45309', defaultDark: '#a6a6a6' },

  { category: 'Forum', group: 'Summary', label: 'Surface', cssVar: '--summary-card-bg', defaultLight: '#fcf6fe', defaultDark: 'rgba(33, 32, 45, 0.50)', hasOpacity: true },
  { category: 'Forum', group: 'Summary', label: 'Text', cssVar: '--summary-card-text', defaultLight: '#7c2d12', defaultDark: '#fef1e1' },

  { category: 'Forum', group: 'Thread List', label: 'Card Surface', cssVar: '--thread-list-card-bg', defaultLight: '#fdf2f6', defaultDark: 'rgba(29, 9, 17, 0.50)', hasOpacity: true },
  { category: 'Forum', group: 'Thread List', label: 'Card Border', cssVar: '--thread-list-card-border', defaultLight: 'rgba(252, 211, 77, 0.34)', defaultDark: 'rgba(216, 24, 24, 0.21)', hasOpacity: true },
  { category: 'Forum', group: 'Thread List', label: 'Tag Surface', cssVar: '--tag-bg', defaultLight: '#fde68a', defaultDark: 'rgba(251,191,36,0.2)', hasOpacity: true },
  { category: 'Forum', group: 'Thread List', label: 'Tag Text', cssVar: '--tag-text', defaultLight: '#78350f', defaultDark: '#fef3c7' },

  { category: 'Forum', group: 'Stance', label: 'Support Accent', cssVar: '--concur-button', defaultLight: '#0d9488', defaultDark: 'rgba(0, 77, 101, 0.59)', hasOpacity: true },
  { category: 'Forum', group: 'Stance', label: 'Oppose Accent', cssVar: '--counter-button', defaultLight: '#ea580c', defaultDark: 'rgba(86, 16, 41, 0.59)', hasOpacity: true },
  { category: 'Forum', group: 'Stance', label: 'Discuss Accent', cssVar: '--discuss-button', defaultLight: 'rgb(100 116 139)', defaultDark: 'rgb(148 163 184)' },
  { category: 'Forum', group: 'Stance', label: 'Discuss Border', cssVar: '--discuss-border', defaultLight: 'rgb(148 163 184)', defaultDark: 'rgb(203 213 225)' },

  { category: 'Forum', group: 'Comment Stream', label: 'Support Comment BG', cssVar: '--stream-concur-bg', defaultLight: 'rgba(20, 184, 166, 0.08)', defaultDark: 'rgba(20, 184, 166, 0.03)', hasOpacity: true },
  { category: 'Forum', group: 'Comment Stream', label: 'Oppose Comment BG', cssVar: '--stream-counter-bg', defaultLight: 'rgba(249, 115, 22, 0.08)', defaultDark: 'rgba(249, 115, 22, 0.03)', hasOpacity: true },
  { category: 'Forum', group: 'Comment Stream', label: 'Discuss Comment BG', cssVar: '--stream-discuss-bg', defaultLight: 'rgba(100, 116, 139, 0.08)', defaultDark: 'rgba(148, 163, 184, 0.12)', hasOpacity: true },
  { category: 'Forum', group: 'Comment Stream', label: 'Thread Line', cssVar: '--stream-thread-line', defaultLight: 'rgb(180, 83, 9)', defaultDark: '#a6a6a6' },
  { category: 'Forum', group: 'Comment Stream', label: 'Collapse Pill BG', cssVar: '--stream-collapse-bg', defaultLight: 'rgb(255, 237, 213)', defaultDark: 'rgba(41, 56, 61, 0.20)', hasOpacity: true },
  { category: 'Forum', group: 'Comment Stream', label: 'Comment Body Text', cssVar: '--comment-text', defaultLight: '#451a03', defaultDark: '#fde68a' },

  { category: 'Forum', group: 'Composer', label: 'Composer Surface', cssVar: '--comment-card-bg', defaultLight: '#fef3c7', defaultDark: 'rgba(26, 10, 83, 0.10)', hasOpacity: true },

  // Legacy / compatibility vars (kept for older docs + code paths)
  { category: 'Forum', group: 'Legacy', label: 'Discuss BG (Legacy)', cssVar: '--discuss-bg', defaultLight: 'rgba(100, 116, 139, 0.1)', defaultDark: 'rgba(148, 163, 184, 0.12)', hasOpacity: true },
  { category: 'Forum', group: 'Legacy', label: 'Support Column BG (Legacy)', cssVar: '--concur-bg', defaultLight: '#ccfbf1', defaultDark: 'rgba(19,78,74,0.3)', hasOpacity: true },
  { category: 'Forum', group: 'Legacy', label: 'Support Label (Legacy)', cssVar: '--concur-label', defaultLight: '#0f766e', defaultDark: '#5eead4' },
  { category: 'Forum', group: 'Legacy', label: 'Oppose Column BG (Legacy)', cssVar: '--counter-bg', defaultLight: '#ffedd5', defaultDark: 'rgba(124,45,18,0.3)', hasOpacity: true },
  { category: 'Forum', group: 'Legacy', label: 'Oppose Label (Legacy)', cssVar: '--counter-label', defaultLight: '#c2410c', defaultDark: '#fdba74' },
  { category: 'Forum', group: 'Legacy', label: 'Comment Author Text (Legacy)', cssVar: '--comment-author', defaultLight: '#78350f', defaultDark: 'rgba(250, 204, 204, 0.80)', hasOpacity: true },
  { category: 'Forum', group: 'Legacy', label: 'Comment Meta Text (Legacy)', cssVar: '--comment-meta', defaultLight: '#92400e', defaultDark: '#ff4d4d' },

  // === CONTROLS ===
  { category: 'Controls', group: 'Buttons', label: 'Primary Button BG', cssVar: '--btn-primary-bg', defaultLight: '#059669', defaultDark: '#10b981' },
  { category: 'Controls', group: 'Buttons', label: 'Primary Button Text', cssVar: '--btn-primary-text', defaultLight: '#ffffff', defaultDark: '#022c22' },
  { category: 'Controls', group: 'Buttons', label: 'Secondary Button BG', cssVar: '--btn-secondary-bg', defaultLight: '#d97706', defaultDark: '#f59e0b' },
  { category: 'Controls', group: 'Buttons', label: 'Secondary Button Text', cssVar: '--btn-secondary-text', defaultLight: '#ffffff', defaultDark: '#451a03' },

  // === ICONS ===
  { category: 'Icons', group: 'Icon Colors', label: 'Default', cssVar: '--icon-default', defaultLight: '#64748b', defaultDark: '#94a3b8' },
  { category: 'Icons', group: 'Icon Colors', label: 'Engaged', cssVar: '--icon-engaged', defaultLight: '#ffffff', defaultDark: '#ffffff' },
  { category: 'Icons', group: 'Icon Colors', label: 'Glow', cssVar: '--icon-glow', defaultLight: 'rgba(255,255,255,0.9)', defaultDark: 'rgba(255,255,255,0.9)', hasOpacity: true },
  { category: 'Icons', group: 'Icon Colors', label: 'Shadow Color', cssVar: '--icon-shadow', defaultLight: 'rgba(0, 0, 0, 0.41)', defaultDark: 'rgba(0,0,0,0.2)', hasOpacity: true },
  { category: 'Icons', group: 'Icon Shadow', label: 'Shadow X Offset', cssVar: '--icon-shadow-x', defaultLight: '-2px', defaultDark: '0px' },
  { category: 'Icons', group: 'Icon Shadow', label: 'Shadow Y Offset', cssVar: '--icon-shadow-y', defaultLight: '2px', defaultDark: '1px' },
  { category: 'Icons', group: 'Icon Shadow', label: 'Shadow Blur', cssVar: '--icon-shadow-blur', defaultLight: '2px', defaultDark: '2px' },

  // === MESSAGING ===
  { category: 'Messaging', group: 'Chat', label: 'Chat BG', cssVar: '--chat-bg', defaultLight: '#fef3c7', defaultDark: '#292524' },
  { category: 'Messaging', group: 'Chat', label: 'Sent Message BG', cssVar: '--msg-sent-bg', defaultLight: '#c11f1f', defaultDark: '#b45309' },
  { category: 'Messaging', group: 'Chat', label: 'Received Message BG', cssVar: '--msg-received-bg', defaultLight: '#e2e8f0', defaultDark: '#374151' },
];

const STORAGE_KEY = 'vh_dev_colors_v3';

const categories = [...new Set(COLOR_CONFIGS.map(c => c.category))];

export const DevColorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<Record<string, { light: string; dark: string }>>({});
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [search, setSearch] = useState('');
  const [inspectMode, setInspectMode] = useState(false);
  const [inspectedVars, setInspectedVars] = useState<string[]>([]);
  const [jumpToVar, setJumpToVar] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const controlRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastInspectKeyRef = useRef<string>('');

  const configByVar = useMemo(() => new Map(COLOR_CONFIGS.map((c) => [c.cssVar, c])), []);

  const getDefaults = useCallback(() => {
    const defaults: Record<string, { light: string; dark: string }> = {};
    COLOR_CONFIGS.forEach((c) => {
      defaults[c.cssVar] = { light: c.defaultLight, dark: c.defaultDark };
    });
    return defaults;
  }, []);

  useEffect(() => {
    const defaults = getDefaults();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        // Merge stored values with defaults (so new variables get defaults)
        const parsed = JSON.parse(stored);
        setColors({ ...defaults, ...parsed });
      } catch {
        setColors(defaults);
      }
    } else {
      setColors(defaults);
    }
    setIsDark(document.documentElement.classList.contains('dark'));
  }, [getDefaults]);

  const initDefaults = () => {
    setColors(getDefaults());
  };

  useEffect(() => {
    const root = document.documentElement;
    const mode = isDark ? 'dark' : 'light';
    Object.entries(colors).forEach(([cssVar, values]) => {
      if (values) root.style.setProperty(cssVar, values[mode]);
    });
  }, [colors, isDark]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inspectMode) {
      lastInspectKeyRef.current = '';
      setInspectedVars([]);
      return;
    }

    const extractVarsFromText = (text: string): string[] => {
      const vars: string[] = [];
      const seen = new Set<string>();
      const regex = /var\(\s*(--[a-zA-Z0-9-_]+)\s*(?:,[^)]+)?\)/g;
      let match: RegExpExecArray | null = null;
      while ((match = regex.exec(text))) {
        if (seen.has(match[1])) continue;
        seen.add(match[1]);
        vars.push(match[1]);
      }
      return vars;
    };

    const parseVarList = (raw: string): string[] =>
      raw
        .split(/[,\s]+/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => s.startsWith('--'));

    const extractVarsFromElement = (start: Element): string[] => {
      const collected: string[] = [];
      const seen = new Set<string>();
      let current: Element | null = start;
      let matchesFound = 0;
      for (let depth = 0; current && depth < 8; depth += 1) {
        if (panelRef.current && panelRef.current.contains(current)) return [];

        const before = collected.length;
        const addVar = (v: string) => {
          if (seen.has(v)) return;
          seen.add(v);
          collected.push(v);
        };

        const manual = (current as HTMLElement).dataset?.vhColorVars;
        if (manual) parseVarList(manual).forEach(addVar);

        const styleText = current.getAttribute('style') ?? '';
        extractVarsFromText(styleText).forEach(addVar);

        const classText = current.getAttribute('class') ?? '';
        extractVarsFromText(classText).forEach(addVar);

        if (collected.length > before) matchesFound += 1;
        if (matchesFound >= 3) break;
        current = current.parentElement;
      }
      return collected;
    };

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (panelRef.current && panelRef.current.contains(target)) return;

      const extracted = extractVarsFromElement(target);
      const matched = extracted.filter((v) => configByVar.has(v));

      const key = matched.join('|');
      if (key === lastInspectKeyRef.current) return;
      lastInspectKeyRef.current = key;

      if (matched.length === 0) {
        setInspectedVars([]);
        return;
      }

      setInspectedVars(matched);
      const primary = matched[0];
      const config = configByVar.get(primary);
      if (config) {
        setActiveCategory(config.category);
        setJumpToVar(primary);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectMode(false);
      }
    };

    document.addEventListener('pointerover', onPointerOver, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerover', onPointerOver, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [inspectMode, configByVar]);

  useEffect(() => {
    if (!jumpToVar) return;
    const el = controlRefs.current[jumpToVar];
    if (!el) return;
    el.scrollIntoView({ block: 'center' });
    setJumpToVar(null);
  }, [jumpToVar, activeCategory, search]);

  // These useMemo hooks MUST be called unconditionally (before any early returns)
  const normalizedQuery = search.trim().toLowerCase();
  const showSearchResults = normalizedQuery.length > 0;

  const visibleConfigs = useMemo(() => {
    const matches = (c: ColorConfig) => {
      if (!normalizedQuery) return true;
      const haystack = `${c.category} ${c.group} ${c.label} ${c.cssVar}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    };

    if (showSearchResults) {
      return COLOR_CONFIGS.filter((c) => matches(c) || inspectedVars.includes(c.cssVar));
    }
    return COLOR_CONFIGS.filter((c) => c.category === activeCategory);
  }, [activeCategory, normalizedQuery, showSearchResults, inspectedVars]);

  const groupedConfigs = useMemo(() => {
    const groups: Array<{ key: string; title: string; items: ColorConfig[] }> = [];
    const index = new Map<string, number>();

    for (const config of visibleConfigs) {
      const key = showSearchResults ? `${config.category}::${config.group}` : config.group;
      const title = showSearchResults ? `${config.category} / ${config.group}` : config.group;
      const existing = index.get(key);
      if (existing === undefined) {
        index.set(key, groups.length);
        groups.push({ key, title, items: [config] });
      } else {
        groups[existing].items.push(config);
      }
    }

    return groups;
  }, [visibleConfigs, showSearchResults]);

  const updateColor = (cssVar: string, value: string) => {
    const mode = isDark ? 'dark' : 'light';
    setColors((prev) => {
      const updated = { ...prev, [cssVar]: { ...prev[cssVar], [mode]: value } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetColors = () => {
    initDefaults();
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportCSS = () => {
    const lightVars = COLOR_CONFIGS.map(c => `  ${c.cssVar}: ${colors[c.cssVar]?.light || c.defaultLight};`).join('\n');
    const darkVars = COLOR_CONFIGS.map(c => `  ${c.cssVar}: ${colors[c.cssVar]?.dark || c.defaultDark};`).join('\n');
    const css = `:root {\n${lightVars}\n}\n\n.dark {\n${darkVars}\n}`;
    navigator.clipboard.writeText(css);
    alert('CSS copied to clipboard!');
  };

  const saveAsDefaults = () => {
    const formatValue = (val: string) => `'${val}'`;

    let lightSection = '';
    let darkSection = '';

    categories.forEach((category) => {
      lightSection += `          // ${category}\n`;
      darkSection += `          // ${category}\n`;

      const groupMap = new Map<string, ColorConfig[]>();
      COLOR_CONFIGS.filter((c) => c.category === category).forEach((c) => {
        const list = groupMap.get(c.group) ?? [];
        list.push(c);
        groupMap.set(c.group, list);
      });

      for (const [group, configs] of groupMap) {
        lightSection += `          // - ${group}\n`;
        darkSection += `          // - ${group}\n`;
        configs.forEach((c) => {
          const lightVal = colors[c.cssVar]?.light || c.defaultLight;
          const darkVal = colors[c.cssVar]?.dark || c.defaultDark;
          lightSection += `          '${c.cssVar}': ${formatValue(lightVal)},\n`;
          darkSection += `          '${c.cssVar}': ${formatValue(darkVal)},\n`;
        });
      }
    });

    const tailwindConfig = `// 📋 PASTE THIS INTO tailwind.config.cjs (replace the addBase section)
// Generated: ${new Date().toLocaleString()}

plugins: [
  require('tailwindcss/plugin')(function ({ addBase }) {
    addBase({
      ':root': {
${lightSection}      },
      '.dark': {
${darkSection}      }
    });
  })
]`;

    navigator.clipboard.writeText(tailwindConfig);
    alert('✅ Tailwind config copied to clipboard!\n\nPaste into tailwind.config.cjs to make these your new defaults.');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] rounded-full bg-purple-600 p-3 text-white shadow-lg hover:bg-purple-700"
        title="Open Color Panel"
      >
        🎨
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed bottom-4 right-4 z-[9999] max-h-[85vh] w-96 overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800 flex flex-col"
    >
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white">🎨 Color Tuner</h3>
          <div className="flex gap-1">
            <button onClick={saveAsDefaults} className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700" title="Copy Tailwind config to clipboard">💾 Save</button>
            <button onClick={exportCSS} className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600" title="Copy CSS variables to clipboard">CSS</button>
            <button onClick={resetColors} className="rounded bg-slate-500 px-2 py-1 text-xs text-white hover:bg-slate-600" title="Reset to defaults">↺</button>
            <button onClick={() => setIsOpen(false)} className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600">✕</button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-medium ${isDark ? 'text-purple-400' : 'text-amber-600'}`}>
            {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </span>
          <span className="text-slate-400">• Toggle theme to edit each mode</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search (e.g. thread, stream, btn, --thread-surface)"
            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Search color variables"
          />
          <button
            type="button"
            onClick={() => setInspectMode((v) => !v)}
            className={[
              'rounded px-2 py-1 text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400',
              inspectMode
                ? 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
            ].join(' ')}
            aria-pressed={inspectMode}
            aria-label={inspectMode ? 'Disable hover inspect' : 'Enable hover inspect'}
            title={inspectMode ? 'Inspect on (Esc to exit)' : 'Inspect: hover the UI to jump'}
          >
            🎯 Inspect
          </button>
        </div>

        {inspectMode && (
          <div className="mt-1 text-[10px] text-slate-400">
            Inspect on: hover the UI to jump to controls (Esc to exit)
          </div>
        )}

        {inspectMode && inspectedVars.length > 0 && (
          <div className="mt-1 text-[10px] text-slate-400">
            Hover match: {inspectedVars.slice(0, 2).map((v) => configByVar.get(v)?.label ?? v).join(', ')}
            {inspectedVars.length > 2 ? ` +${inspectedVars.length - 2}` : ''}
          </div>
        )}

        {showSearchResults && (
          <div className="mt-1 text-[10px] text-slate-400">
            Search results across all sections
          </div>
        )}
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap ${
              activeCategory === cat
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {groupedConfigs.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            No matches. Try a different search.
          </div>
        )}

        {groupedConfigs.map((group) => (
          <div key={group.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.title}
              </p>
              {showSearchResults && (
                <button
                  type="button"
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={() => {
                    const first = group.items[0];
                    setActiveCategory(first.category);
                    setSearch('');
                    setJumpToVar(first.cssVar);
                  }}
                  aria-label={`Jump to ${group.title}`}
                >
                  Jump
                </button>
              )}
            </div>

            {group.items.map((config) => {
              const currentValue =
                colors[config.cssVar]?.[isDark ? 'dark' : 'light'] ||
                (isDark ? config.defaultDark : config.defaultLight);
              const isPxValue = currentValue.endsWith('px') || config.defaultLight.endsWith('px');
              const highlighted = inspectedVars.includes(config.cssVar);

              const cardBase =
                'p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-2 transition-colors';
              const cardHighlight = highlighted
                ? 'ring-2 ring-purple-500 bg-purple-50/40 dark:bg-purple-900/20'
                : '';
              const cardClassName = `${cardBase} ${cardHighlight}`.trim();

              // Pixel value editor (for shadow X, Y, blur)
              if (isPxValue) {
                const pxValue = parseInt(currentValue) || 0;
                const handlePxChange = (val: number) => {
                  updateColor(config.cssVar, `${val}px`);
                };
                return (
                  <div
                    key={config.cssVar}
                    ref={(el) => {
                      controlRefs.current[config.cssVar] = el;
                    }}
                    className={cardClassName}
                    data-css-var={config.cssVar}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{config.label}</p>
                      <span className="text-[10px] font-mono text-slate-400">{config.cssVar}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        value={pxValue}
                        onChange={(e) => handlePxChange(parseInt(e.target.value))}
                        className="flex-1 h-2 accent-purple-500"
                        aria-label={`${config.label} slider`}
                      />
                      <input
                        type="number"
                        value={pxValue}
                        onChange={(e) => handlePxChange(parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-mono text-center"
                        aria-label={`${config.label} value`}
                      />
                      <span className="text-xs text-slate-500">px</span>
                    </div>
                  </div>
                );
              }

              // Color value editor
              const { hex, alpha } = parseColor(currentValue);
              const hsl = hexToHsl(hex);

              const handleHexChange = (newHex: string) => {
                updateColor(config.cssVar, buildColor(newHex, alpha));
              };

              const handleSaturationChange = (sat: number) => {
                const newHex = hslToHex(hsl.h, sat, hsl.l);
                updateColor(config.cssVar, buildColor(newHex, alpha));
              };

              const handleLightnessChange = (light: number) => {
                const newHex = hslToHex(hsl.h, hsl.s, light);
                updateColor(config.cssVar, buildColor(newHex, alpha));
              };

              const handleAlphaChange = (newAlpha: number) => {
                updateColor(config.cssVar, buildColor(hex, newAlpha));
              };

              return (
                <div
                  key={config.cssVar}
                  ref={(el) => {
                    controlRefs.current[config.cssVar] = el;
                  }}
                  className={cardClassName}
                  data-css-var={config.cssVar}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 shrink-0"
                      aria-label={`${config.label} color picker`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{config.label}</p>
                        <span className="text-[10px] font-mono text-slate-400">{config.cssVar}</span>
                      </div>
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => updateColor(config.cssVar, e.target.value)}
                        className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-1 py-0.5 text-[10px] font-mono"
                        aria-label={`${config.label} raw value`}
                      />
                    </div>
                    <div
                      className="h-6 w-6 rounded border border-slate-300 dark:border-slate-600 shrink-0"
                      style={{ backgroundColor: currentValue }}
                      title="Preview"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <label className="text-slate-500 dark:text-slate-400">Saturation</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hsl.s}
                        onChange={(e) => handleSaturationChange(parseInt(e.target.value))}
                        className="w-full h-1 accent-purple-500"
                        aria-label={`${config.label} saturation`}
                      />
                      <span className="text-slate-600 dark:text-slate-300">{hsl.s}%</span>
                    </div>
                    <div>
                      <label className="text-slate-500 dark:text-slate-400">Lightness</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hsl.l}
                        onChange={(e) => handleLightnessChange(parseInt(e.target.value))}
                        className="w-full h-1 accent-purple-500"
                        aria-label={`${config.label} lightness`}
                      />
                      <span className="text-slate-600 dark:text-slate-300">{hsl.l}%</span>
                    </div>
                    <div>
                      <label className="text-slate-500 dark:text-slate-400">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(alpha * 100)}
                        onChange={(e) => handleAlphaChange(parseInt(e.target.value) / 100)}
                        className="w-full h-1 accent-purple-500"
                        aria-label={`${config.label} opacity`}
                      />
                      <span className="text-slate-600 dark:text-slate-300">{Math.round(alpha * 100)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
        <strong>Sliders:</strong> Sat (color intensity), Light (brightness), Opacity (transparency)
      </div>
    </div>
  );
};

export default DevColorPanel;
