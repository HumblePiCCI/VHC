import React, { useCallback, useEffect, useState } from 'react';

interface ColorConfig {
  label: string;
  cssVar: string;
  defaultLight: string;
  defaultDark: string;
  category: string;
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
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return { hex: `#${r}${g}${b}`, alpha: match[4] ? parseFloat(match[4]) : 1 };
    }
  }
  if (color.startsWith('#')) {
    return { hex: color.slice(0, 7), alpha: 1 };
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
  // === PAGE BACKGROUNDS ===
  { label: 'VENN Page Background', cssVar: '--page-bg-venn', defaultLight: '#ecfdf5', defaultDark: '#022c22', category: 'Page' },
  { label: 'HERMES Page Background', cssVar: '--page-bg-hermes', defaultLight: '#fff7ed', defaultDark: '#1c1917', category: 'Page' },
  { label: 'AGORA Page Background', cssVar: '--page-bg-agora', defaultLight: '#f1f5f9', defaultDark: '#0f172a', category: 'Page' },
  
  // === SECTION CONTAINERS (Headlines/Forum wrapper) ===
  { label: 'Section Container BG', cssVar: '--section-container-bg', defaultLight: '#ffffff', defaultDark: 'rgba(30,41,59,0.5)', category: 'Page', hasOpacity: true },
  { label: 'Section Container Border', cssVar: '--section-container-border', defaultLight: '#e2e8f0', defaultDark: 'rgba(71,85,105,0.5)', category: 'Page', hasOpacity: true },
  { label: 'Section Title', cssVar: '--section-title', defaultLight: '#1e293b', defaultDark: '#f1f5f9', category: 'Page' },
  
  // === VENN COMPONENTS ===
  { label: 'Headline Card BG', cssVar: '--headline-card-bg', defaultLight: '#d1fae5', defaultDark: '#064e3b', category: 'VENN Cards' },
  { label: 'Headline Card Border', cssVar: '--headline-card-border', defaultLight: '#a7f3d0', defaultDark: '#047857', category: 'VENN Cards' },
  { label: 'Headline Card Text', cssVar: '--headline-card-text', defaultLight: '#064e3b', defaultDark: '#ecfdf5', category: 'VENN Cards' },
  { label: 'Headline Card Muted', cssVar: '--headline-card-muted', defaultLight: '#059669', defaultDark: '#a7f3d0', category: 'VENN Cards' },
  
  { label: 'Analysis Surface', cssVar: '--analysis-surface', defaultLight: '#a7f3d0', defaultDark: 'rgba(6,78,59,0.4)', category: 'VENN Cards', hasOpacity: true },
  { label: 'Analysis Label', cssVar: '--analysis-label', defaultLight: '#047857', defaultDark: '#99f6e4', category: 'VENN Cards' },
  { label: 'Analysis Text', cssVar: '--analysis-text', defaultLight: '#064e3b', defaultDark: '#f0fdfa', category: 'VENN Cards' },
  
  { label: 'Bias Table BG', cssVar: '--bias-table-bg', defaultLight: '#ecfdf5', defaultDark: 'rgba(6,78,59,0.3)', category: 'VENN Cards', hasOpacity: true },
  { label: 'Bias Row Hover', cssVar: '--bias-row-hover', defaultLight: '#d1fae5', defaultDark: 'rgba(20,184,166,0.2)', category: 'VENN Cards' },
  
  // === HERMES COMPONENTS ===
  { label: 'Thread Surface', cssVar: '--thread-surface', defaultLight: '#fed7aa', defaultDark: 'rgba(120,53,15,0.4)', category: 'HERMES Cards', hasOpacity: true },
  { label: 'Thread Title', cssVar: '--thread-title', defaultLight: '#78350f', defaultDark: '#fef3c7', category: 'HERMES Cards' },
  { label: 'Thread Text', cssVar: '--thread-text', defaultLight: '#92400e', defaultDark: '#fde68a', category: 'HERMES Cards' },
  { label: 'Thread Muted', cssVar: '--thread-muted', defaultLight: '#b45309', defaultDark: '#fcd34d', category: 'HERMES Cards' },
  
  { label: 'Summary Card BG', cssVar: '--summary-card-bg', defaultLight: '#ffedd5', defaultDark: 'rgba(154,52,18,0.3)', category: 'HERMES Cards', hasOpacity: true },
  { label: 'Summary Card Text', cssVar: '--summary-card-text', defaultLight: '#7c2d12', defaultDark: '#fed7aa', category: 'HERMES Cards' },
  
  // === THREAD LIST (Forum Feed) ===
  { label: 'Thread Card BG', cssVar: '--thread-list-card-bg', defaultLight: '#fef3c7', defaultDark: 'rgba(120,53,15,0.5)', category: 'Thread List', hasOpacity: true },
  { label: 'Thread Card Border', cssVar: '--thread-list-card-border', defaultLight: '#fcd34d', defaultDark: 'rgba(251,191,36,0.3)', category: 'Thread List' },
  { label: 'Tag BG', cssVar: '--tag-bg', defaultLight: '#fde68a', defaultDark: 'rgba(251,191,36,0.2)', category: 'Thread List', hasOpacity: true },
  { label: 'Tag Text', cssVar: '--tag-text', defaultLight: '#78350f', defaultDark: '#fef3c7', category: 'Thread List' },

  // === DEBATE COLUMNS ===
  { label: 'Concur Column BG', cssVar: '--concur-bg', defaultLight: '#ccfbf1', defaultDark: 'rgba(19,78,74,0.3)', category: 'Debate', hasOpacity: true },
  { label: 'Concur Label', cssVar: '--concur-label', defaultLight: '#0f766e', defaultDark: '#5eead4', category: 'Debate' },
  { label: 'Concur Button', cssVar: '--concur-button', defaultLight: '#0d9488', defaultDark: '#14b8a6', category: 'Debate' },
  
  { label: 'Counter Column BG', cssVar: '--counter-bg', defaultLight: '#ffedd5', defaultDark: 'rgba(124,45,18,0.3)', category: 'Debate', hasOpacity: true },
  { label: 'Counter Label', cssVar: '--counter-label', defaultLight: '#c2410c', defaultDark: '#fdba74', category: 'Debate' },
  { label: 'Counter Button', cssVar: '--counter-button', defaultLight: '#ea580c', defaultDark: '#f97316', category: 'Debate' },
  
  // === COMMENT CARDS ===
  { label: 'Comment Card BG', cssVar: '--comment-card-bg', defaultLight: '#fef3c7', defaultDark: 'rgba(120,53,15,0.5)', category: 'Comments', hasOpacity: true },
  { label: 'Comment Author', cssVar: '--comment-author', defaultLight: '#78350f', defaultDark: '#fef3c7', category: 'Comments' },
  { label: 'Comment Text', cssVar: '--comment-text', defaultLight: '#451a03', defaultDark: '#fde68a', category: 'Comments' },
  { label: 'Comment Meta', cssVar: '--comment-meta', defaultLight: '#92400e', defaultDark: '#fcd34d', category: 'Comments' },
  
  // === BUTTONS & CONTROLS ===
  { label: 'Primary Button BG', cssVar: '--btn-primary-bg', defaultLight: '#059669', defaultDark: '#10b981', category: 'Controls' },
  { label: 'Primary Button Text', cssVar: '--btn-primary-text', defaultLight: '#ffffff', defaultDark: '#022c22', category: 'Controls' },
  { label: 'Secondary Button BG', cssVar: '--btn-secondary-bg', defaultLight: '#d97706', defaultDark: '#f59e0b', category: 'Controls' },
  { label: 'Secondary Button Text', cssVar: '--btn-secondary-text', defaultLight: '#ffffff', defaultDark: '#451a03', category: 'Controls' },
  
  // === ICONS (Colors) ===
  { label: 'Icon Default', cssVar: '--icon-default', defaultLight: '#64748b', defaultDark: '#94a3b8', category: 'Icons' },
  { label: 'Icon Engaged', cssVar: '--icon-engaged', defaultLight: '#ffffff', defaultDark: '#ffffff', category: 'Icons' },
  { label: 'Icon Glow', cssVar: '--icon-glow', defaultLight: 'rgba(255,255,255,0.9)', defaultDark: 'rgba(255,255,255,0.9)', category: 'Icons', hasOpacity: true },
  { label: 'Icon Shadow Color', cssVar: '--icon-shadow', defaultLight: 'rgba(0,0,0,0.4)', defaultDark: 'rgba(0,0,0,0.2)', category: 'Icons', hasOpacity: true },
  // Shadow position (px values) - handled separately
  { label: 'Shadow X Offset', cssVar: '--icon-shadow-x', defaultLight: '0px', defaultDark: '0px', category: 'Icons' },
  { label: 'Shadow Y Offset', cssVar: '--icon-shadow-y', defaultLight: '1px', defaultDark: '1px', category: 'Icons' },
  { label: 'Shadow Blur', cssVar: '--icon-shadow-blur', defaultLight: '2px', defaultDark: '2px', category: 'Icons' },
  
  // === MESSAGING ===
  { label: 'Chat BG', cssVar: '--chat-bg', defaultLight: '#fef3c7', defaultDark: '#292524', category: 'Messaging' },
  { label: 'Message Sent', cssVar: '--msg-sent-bg', defaultLight: '#d97706', defaultDark: '#b45309', category: 'Messaging' },
  { label: 'Message Received', cssVar: '--msg-received-bg', defaultLight: '#e2e8f0', defaultDark: '#374151', category: 'Messaging' },
];

const STORAGE_KEY = 'vh_dev_colors_v3';

const categories = [...new Set(COLOR_CONFIGS.map(c => c.category))];

export const DevColorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<Record<string, { light: string; dark: string }>>({});
  const [activeCategory, setActiveCategory] = useState(categories[0]);

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
    // Group by category for readability
    const categoryMap: Record<string, ColorConfig[]> = {};
    COLOR_CONFIGS.forEach(c => {
      if (!categoryMap[c.category]) categoryMap[c.category] = [];
      categoryMap[c.category].push(c);
    });

    const formatValue = (val: string) => `'${val}'`;

    let lightSection = '';
    let darkSection = '';

    Object.entries(categoryMap).forEach(([category, configs]) => {
      lightSection += `          // ${category}\n`;
      darkSection += `          // ${category}\n`;
      configs.forEach(c => {
        const lightVal = colors[c.cssVar]?.light || c.defaultLight;
        const darkVal = colors[c.cssVar]?.dark || c.defaultDark;
        lightSection += `          '${c.cssVar}': ${formatValue(lightVal)},\n`;
        darkSection += `          '${c.cssVar}': ${formatValue(darkVal)},\n`;
      });
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

  const filteredConfigs = COLOR_CONFIGS.filter(c => c.category === activeCategory);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-h-[85vh] w-96 overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800 flex flex-col">
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

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredConfigs.map((config) => {
          const currentValue = colors[config.cssVar]?.[isDark ? 'dark' : 'light'] || (isDark ? config.defaultDark : config.defaultLight);
          const isPxValue = currentValue.endsWith('px') || config.defaultLight.endsWith('px');

          // Pixel value editor (for shadow X, Y, blur)
          if (isPxValue) {
            const pxValue = parseInt(currentValue) || 0;
            const handlePxChange = (val: number) => {
              updateColor(config.cssVar, `${val}px`);
            };
            return (
              <div key={config.cssVar} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-2">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{config.label}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={pxValue}
                    onChange={(e) => handlePxChange(parseInt(e.target.value))}
                    className="flex-1 h-2 accent-purple-500"
                  />
                  <input
                    type="number"
                    value={pxValue}
                    onChange={(e) => handlePxChange(parseInt(e.target.value) || 0)}
                    className="w-16 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-mono text-center"
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
            <div key={config.cssVar} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border-0 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{config.label}</p>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => updateColor(config.cssVar, e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-1 py-0.5 text-[10px] font-mono"
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
                  />
                  <span className="text-slate-600 dark:text-slate-300">{Math.round(alpha * 100)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
        <strong>Sliders:</strong> Sat (color intensity), Light (brightness), Opacity (transparency)
      </div>
    </div>
  );
};

export default DevColorPanel;
