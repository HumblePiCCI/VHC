/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        card: {
          DEFAULT: 'var(--card-bg)',
          muted: 'var(--card-muted-bg)'
        },
        surface: {
          light: 'var(--surface-light)',
          dark: 'var(--surface-dark)'
        }
      }
    }
  },
  plugins: [
    require('tailwindcss/plugin')(function ({ addBase }) {
      addBase({
        ':root': {
          // Global
          // - Page Backgrounds
          '--page-bg-venn': 'rgba(138, 254, 241, 0.12)',
          '--page-bg-hermes': 'rgba(241, 214, 218, 0.35)',
          '--page-bg-agora': '#f1f5f9',
          // - Section Containers
          '--section-container-bg': 'rgba(255, 255, 255, 0.77)',
          '--section-container-border': '#e2e8f0',
          '--section-title': '#1e293b',
          // VENN
          // - Headline Cards
          '--headline-card-bg': '#cae8e8',
          '--headline-card-border': 'rgba(167, 243, 208, 0.59)',
          '--headline-card-text': '#064e3b',
          '--headline-card-muted': '#059669',
          // - Analysis
          '--analysis-surface': 'rgba(255, 255, 255, 0.53)',
          '--analysis-label': '#047857',
          '--analysis-text': '#064e3b',
          // - Bias Table
          '--bias-table-bg': '#ecfdf5',
          '--bias-row-hover': '#d1fae5',
          // Forum
          // - Thread Card
          '--thread-surface': '#fdf2f6',
          '--thread-title': '#78350f',
          '--thread-text': '#92400e',
          '--thread-muted': '#b45309',
          // - Summary
          '--summary-card-bg': '#fcf6fe',
          '--summary-card-text': '#7c2d12',
          // - Thread List
          '--thread-list-card-bg': '#fdf2f6',
          '--thread-list-card-border': 'rgba(252, 211, 77, 0.34)',
          '--tag-bg': '#fde68a',
          '--tag-text': '#78350f',
          // - Stance
          '--concur-button': '#0d9488',
          '--counter-button': '#ea580c',
          '--discuss-button': 'rgb(100 116 139)',
          '--discuss-border': 'rgb(148 163 184)',
          // - Comment Stream
          '--stream-concur-bg': 'rgba(20, 184, 166, 0.08)',
          '--stream-counter-bg': 'rgba(249, 115, 22, 0.08)',
          '--stream-discuss-bg': 'rgba(100, 116, 139, 0.08)',
          '--stream-thread-line': 'rgb(180, 83, 9)',
          '--stream-collapse-bg': 'rgb(255, 237, 213)',
          '--comment-text': '#451a03',
          // - Composer
          '--comment-card-bg': '#fef3c7',
          // - Legacy
          '--discuss-bg': 'rgba(100, 116, 139, 0.1)',
          '--concur-bg': '#ccfbf1',
          '--concur-label': '#0f766e',
          '--counter-bg': '#ffedd5',
          '--counter-label': '#c2410c',
          '--comment-author': '#78350f',
          '--comment-meta': '#92400e',
          // Controls
          // - Buttons
          '--btn-primary-bg': '#059669',
          '--btn-primary-text': '#ffffff',
          '--btn-secondary-bg': '#d97706',
          '--btn-secondary-text': '#ffffff',
          // Icons
          // - Icon Colors
          '--icon-default': '#64748b',
          '--icon-engaged': '#ffffff',
          '--icon-glow': 'rgba(255,255,255,0.9)',
          '--icon-shadow': 'rgba(0, 0, 0, 0.41)',
          // - Icon Shadow
          '--icon-shadow-x': '-2px',
          '--icon-shadow-y': '2px',
          '--icon-shadow-blur': '2px',
          // Messaging
          // - Chat
          '--chat-bg': '#fef3c7',
          '--msg-sent-bg': '#c11f1f',
          '--msg-received-bg': '#e2e8f0'
        },
        '.dark': {
          // Global
          // - Page Backgrounds
          '--page-bg-venn': '#000f14',
          '--page-bg-hermes': '#19040b',
          '--page-bg-agora': '#0a0f1a',
          // - Section Containers
          '--section-container-bg': 'rgba(30,41,59,0.5)',
          '--section-container-border': 'rgba(71,85,105,0.5)',
          '--section-title': '#f1f5f9',
          // VENN
          // - Headline Cards
          '--headline-card-bg': 'rgba(13, 24, 28, 0.36)',
          '--headline-card-border': 'rgba(4, 120, 87, 0.46)',
          '--headline-card-text': '#ecfdf5',
          '--headline-card-muted': '#a7f3d0',
          // - Analysis
          '--analysis-surface': 'rgba(13, 48, 41, 0.31)',
          '--analysis-label': '#99f6e4',
          '--analysis-text': '#f0fdfa',
          // - Bias Table
          '--bias-table-bg': 'rgba(6,78,59,0.3)',
          '--bias-row-hover': 'rgba(20,184,166,0.2)',
          // Forum
          // - Thread Card
          '--thread-surface': 'rgba(39, 12, 23, 0.50)',
          '--thread-title': '#eed7d7',
          '--thread-text': '#ffffff',
          '--thread-muted': '#a6a6a6',
          // - Summary
          '--summary-card-bg': 'rgba(33, 32, 45, 0.50)',
          '--summary-card-text': '#fef1e1',
          // - Thread List
          '--thread-list-card-bg': 'rgba(29, 9, 17, 0.50)',
          '--thread-list-card-border': 'rgba(216, 24, 24, 0.21)',
          '--tag-bg': 'rgba(251,191,36,0.2)',
          '--tag-text': '#fef3c7',
          // - Stance
          '--concur-button': 'rgba(0, 77, 101, 0.59)',
          '--counter-button': 'rgba(86, 16, 41, 0.59)',
          '--discuss-button': 'rgb(148 163 184)',
          '--discuss-border': 'rgb(203 213 225)',
          // - Comment Stream
          '--stream-concur-bg': 'rgba(20, 184, 166, 0.03)',
          '--stream-counter-bg': 'rgba(249, 115, 22, 0.03)',
          '--stream-discuss-bg': 'rgba(148, 163, 184, 0.12)',
          '--stream-thread-line': '#a6a6a6',
          '--stream-collapse-bg': 'rgba(41, 56, 61, 0.20)',
          '--comment-text': '#fde68a',
          // - Composer
          '--comment-card-bg': 'rgba(26, 10, 83, 0.10)',
          // - Legacy
          '--discuss-bg': 'rgba(148, 163, 184, 0.12)',
          '--concur-bg': 'rgba(19,78,74,0.3)',
          '--concur-label': '#5eead4',
          '--counter-bg': 'rgba(124,45,18,0.3)',
          '--counter-label': '#fdba74',
          '--comment-author': 'rgba(250, 204, 204, 0.80)',
          '--comment-meta': '#ff4d4d',
          // Controls
          // - Buttons
          '--btn-primary-bg': '#10b981',
          '--btn-primary-text': '#022c22',
          '--btn-secondary-bg': '#f59e0b',
          '--btn-secondary-text': '#451a03',
          // Icons
          // - Icon Colors
          '--icon-default': '#94a3b8',
          '--icon-engaged': '#ffffff',
          '--icon-glow': 'rgba(255,255,255,0.9)',
          '--icon-shadow': 'rgba(0,0,0,0.2)',
          // - Icon Shadow
          '--icon-shadow-x': '0px',
          '--icon-shadow-y': '1px',
          '--icon-shadow-blur': '2px',
          // Messaging
          // - Chat
          '--chat-bg': '#292524',
          '--msg-sent-bg': '#b45309',
          '--msg-received-bg': '#374151'
        }
      });
    })
  ]
};
