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
          // Page backgrounds
          '--page-bg-venn': '#ecfdf5',
          '--page-bg-hermes': '#fff7ed',
          '--page-bg-agora': '#f1f5f9',
          // Section containers
          '--section-container-bg': '#ffffff',
          '--section-container-border': '#e2e8f0',
          '--section-title': '#1e293b',
          // VENN cards
          '--headline-card-bg': '#d1fae5',
          '--headline-card-border': '#a7f3d0',
          '--headline-card-text': '#064e3b',
          '--headline-card-muted': '#059669',
          '--analysis-surface': '#a7f3d0',
          '--analysis-label': '#047857',
          '--analysis-text': '#064e3b',
          '--bias-table-bg': '#ecfdf5',
          '--bias-row-hover': '#d1fae5',
          // HERMES cards
          '--thread-surface': '#fed7aa',
          '--thread-title': '#78350f',
          '--thread-text': '#92400e',
          '--thread-muted': '#b45309',
          '--summary-card-bg': '#ffedd5',
          '--summary-card-text': '#7c2d12',
          // Thread list cards (forum feed)
          '--thread-list-card-bg': '#fef3c7',
          '--thread-list-card-border': '#fcd34d',
          '--tag-bg': '#fde68a',
          '--tag-text': '#78350f',
          // Debate columns
          '--concur-bg': '#ccfbf1',
          '--concur-label': '#0f766e',
          '--concur-button': '#0d9488',
          '--counter-bg': '#ffedd5',
          '--counter-label': '#c2410c',
          '--counter-button': '#ea580c',
          // Comments
          '--comment-card-bg': '#fef3c7',
          '--comment-author': '#78350f',
          '--comment-text': '#451a03',
          '--comment-meta': '#92400e',
          // Buttons
          '--btn-primary-bg': '#059669',
          '--btn-primary-text': '#ffffff',
          '--btn-secondary-bg': '#d97706',
          '--btn-secondary-text': '#ffffff',
          // Icons
          '--icon-default': '#64748b',
          '--icon-engaged': '#ffffff',
          '--icon-glow': 'rgba(255,255,255,0.9)',
          '--icon-shadow': 'rgba(0,0,0,0.4)',
          '--icon-shadow-x': '0px',
          '--icon-shadow-y': '1px',
          '--icon-shadow-blur': '2px',
          // Messaging
          '--chat-bg': '#fef3c7',
          '--msg-sent-bg': '#d97706',
          '--msg-received-bg': '#e2e8f0'
        },
        '.dark': {
          // Page backgrounds
          '--page-bg-venn': '#022c22',
          '--page-bg-hermes': '#1c1917',
          '--page-bg-agora': '#0f172a',
          // Section containers
          '--section-container-bg': 'rgba(30,41,59,0.5)',
          '--section-container-border': 'rgba(71,85,105,0.5)',
          '--section-title': '#f1f5f9',
          // VENN cards
          '--headline-card-bg': '#064e3b',
          '--headline-card-border': '#047857',
          '--headline-card-text': '#ecfdf5',
          '--headline-card-muted': '#a7f3d0',
          '--analysis-surface': 'rgba(6,78,59,0.4)',
          '--analysis-label': '#99f6e4',
          '--analysis-text': '#f0fdfa',
          '--bias-table-bg': 'rgba(6,78,59,0.3)',
          '--bias-row-hover': 'rgba(20,184,166,0.2)',
          // HERMES cards
          '--thread-surface': 'rgba(120,53,15,0.4)',
          '--thread-title': '#fef3c7',
          '--thread-text': '#fde68a',
          '--thread-muted': '#fcd34d',
          '--summary-card-bg': 'rgba(154,52,18,0.3)',
          '--summary-card-text': '#fed7aa',
          // Thread list cards (forum feed)
          '--thread-list-card-bg': 'rgba(120,53,15,0.5)',
          '--thread-list-card-border': 'rgba(251,191,36,0.3)',
          '--tag-bg': 'rgba(251,191,36,0.2)',
          '--tag-text': '#fef3c7',
          // Debate columns
          '--concur-bg': 'rgba(19,78,74,0.3)',
          '--concur-label': '#5eead4',
          '--concur-button': '#14b8a6',
          '--counter-bg': 'rgba(124,45,18,0.3)',
          '--counter-label': '#fdba74',
          '--counter-button': '#f97316',
          // Comments
          '--comment-card-bg': 'rgba(120,53,15,0.5)',
          '--comment-author': '#fef3c7',
          '--comment-text': '#fde68a',
          '--comment-meta': '#fcd34d',
          // Buttons
          '--btn-primary-bg': '#10b981',
          '--btn-primary-text': '#022c22',
          '--btn-secondary-bg': '#f59e0b',
          '--btn-secondary-text': '#451a03',
          // Icons
          '--icon-default': '#94a3b8',
          '--icon-engaged': '#ffffff',
          '--icon-glow': 'rgba(255,255,255,0.9)',
          '--icon-shadow': 'rgba(0,0,0,0.2)',
          '--icon-shadow-x': '0px',
          '--icon-shadow-y': '1px',
          '--icon-shadow-blur': '2px',
          // Messaging
          '--chat-bg': '#292524',
          '--msg-sent-bg': '#b45309',
          '--msg-received-bg': '#374151'
        }
      });
    })
  ]
};
