import { type ColorConfig } from './colorUtils';

export const COLOR_CONFIGS: ColorConfig[] = [
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

export const STORAGE_KEY = 'vh_dev_colors_v3';

export const categories = [...new Set(COLOR_CONFIGS.map(c => c.category))];
