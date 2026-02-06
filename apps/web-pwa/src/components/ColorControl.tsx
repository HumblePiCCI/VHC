import React from 'react';

import { buildColor, hexToHsl, hslToHex, parseColor, type ColorConfig } from './colorUtils';

interface ColorControlProps {
  config: ColorConfig;
  currentValue: string;
  highlighted: boolean;
  onUpdate: (cssVar: string, value: string) => void;
  controlRef: (el: HTMLDivElement | null) => void;
}

export const ColorControl: React.FC<ColorControlProps> = (props) => {
  const { config, currentValue, highlighted, onUpdate, controlRef } = props;
  const isPxValue = currentValue.endsWith('px') || config.defaultLight.endsWith('px');

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
      onUpdate(config.cssVar, `${val}px`);
    };

    return (
      <div
        ref={controlRef}
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
    onUpdate(config.cssVar, buildColor(newHex, alpha));
  };

  const handleSaturationChange = (sat: number) => {
    const newHex = hslToHex(hsl.h, sat, hsl.l);
    onUpdate(config.cssVar, buildColor(newHex, alpha));
  };

  const handleLightnessChange = (light: number) => {
    const newHex = hslToHex(hsl.h, hsl.s, light);
    onUpdate(config.cssVar, buildColor(newHex, alpha));
  };

  const handleAlphaChange = (newAlpha: number) => {
    onUpdate(config.cssVar, buildColor(hex, newAlpha));
  };

  return (
    <div
      ref={controlRef}
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
            onChange={(e) => onUpdate(config.cssVar, e.target.value)}
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
};

export default ColorControl;
