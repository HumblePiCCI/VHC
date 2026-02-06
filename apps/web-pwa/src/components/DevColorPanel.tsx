import React from 'react';

import ColorControl from './ColorControl';
import { useColorPanel } from './useColorPanel';

export const DevColorPanel: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    isDark,
    colors,
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    inspectMode,
    setInspectMode,
    inspectedVars,
    panelRef,
    controlRefs,
    configByVar,
    categories,
    showSearchResults,
    groupedConfigs,
    updateColor,
    resetColors,
    exportCSS,
    saveAsDefaults,
    setJumpToVar,
  } = useColorPanel();

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
                    if (!first) return;
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
              const highlighted = inspectedVars.includes(config.cssVar);

              return (
                <ColorControl
                  key={config.cssVar}
                  config={config}
                  currentValue={currentValue}
                  highlighted={highlighted}
                  onUpdate={updateColor}
                  controlRef={(el) => {
                    controlRefs.current[config.cssVar] = el;
                  }}
                />
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
