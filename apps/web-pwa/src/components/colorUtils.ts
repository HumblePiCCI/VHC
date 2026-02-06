export interface ColorConfig {
  label: string;
  cssVar: string;
  defaultLight: string;
  defaultDark: string;
  category: string;
  group: string;
  hasOpacity?: boolean;
}

// Convert hex to HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 50, l: 50 };
  const [, rHex = '00', gHex = '00', bHex = '00'] = result;
  let r = parseInt(rHex, 16) / 255;
  let g = parseInt(gHex, 16) / 255;
  let b = parseInt(bHex, 16) / 255;
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
export function hslToHex(h: number, s: number, l: number): string {
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
export function parseColor(color: string): { hex: string; alpha: number } {
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
      const [, rRaw = '0', gRaw = '0', bRaw = '0', alphaRaw] = match;
      const r = parseInt(rRaw).toString(16).padStart(2, '0');
      const g = parseInt(gRaw).toString(16).padStart(2, '0');
      const b = parseInt(bRaw).toString(16).padStart(2, '0');
      return { hex: `#${r}${g}${b}`, alpha: alphaRaw ? parseFloat(alphaRaw) : 1 };
    }
  }

  if (trimmed.startsWith('#')) {
    return { hex: trimmed.slice(0, 7), alpha: 1 };
  }
  return { hex: '#888888', alpha: 1 };
}

// Build color string from hex and alpha
export function buildColor(hex: string, alpha: number): string {
  if (alpha >= 1) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}
