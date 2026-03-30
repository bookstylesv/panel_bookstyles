/**
 * colors.ts — Design tokens del sistema Speeddan Control.
 * Copiado del sistema de temas del DTE superadmin.
 */

export interface ThemeValues {
  accent:     string;
  accentText: string;
  pageBg:     string;
  cardBg:     string;
  sidebarBg:  string;
  glassBlur?: string;
}

export const DEFAULT_THEME: ThemeValues = {
  accent:     '#111111',
  accentText: '#ffffff',
  pageBg:     '#f5f5f5',
  cardBg:     '#ffffff',
  sidebarBg:  '#ffffff',
  glassBlur:  '',
};

function _isDarkColor(color: string): boolean {
  if (!color) return false;
  if (color.startsWith('linear-gradient') || color.startsWith('radial-gradient')) return true;
  const rgbaMatch = color.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const lum = (0.299 * +rgbaMatch[1] + 0.587 * +rgbaMatch[2] + 0.114 * +rgbaMatch[3]) / 255;
    return lum < 0.45;
  }
  const hex = color.replace('#', '');
  if (hex.length >= 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
  }
  return false;
}

function _applyTextMode(dark: boolean): void {
  const root = document.documentElement;
  if (dark) {
    root.style.setProperty('--text-primary',   '#e8e8f0');
    root.style.setProperty('--text-secondary',  '#a8afc0');
    root.style.setProperty('--text-muted',      '#6b7280');
    root.style.setProperty('--border',          'rgba(255,255,255,0.10)');
    root.style.setProperty('--border-light',    'rgba(255,255,255,0.06)');
    root.style.setProperty('--row-bg',          'rgba(255,255,255,0.02)');
    root.style.setProperty('--row-bg-alt',      'rgba(255,255,255,0.05)');
    root.style.setProperty('--row-hover',       'rgba(255,255,255,0.09)');
    root.style.setProperty('--th-bg',           'rgba(0,0,0,0.22)');
    root.style.setProperty('--input-bg',        'rgba(255,255,255,0.08)');
    root.style.setProperty('--skeleton-from',   'rgba(255,255,255,0.06)');
    root.style.setProperty('--skeleton-to',     'rgba(255,255,255,0.11)');
  } else {
    root.style.setProperty('--text-primary',   '#111111');
    root.style.setProperty('--text-secondary', '#444444');
    root.style.setProperty('--text-muted',     '#9b9b9b');
    root.style.setProperty('--border',         '#e5e5e5');
    root.style.setProperty('--border-light',   '#f0f0f0');
    root.style.setProperty('--row-bg',         '#ffffff');
    root.style.setProperty('--row-bg-alt',     '#fafafc');
    root.style.setProperty('--row-hover',      '#f5f5f5');
    root.style.setProperty('--th-bg',          'linear-gradient(to bottom, #fafbfd, #f4f5f8)');
    root.style.setProperty('--input-bg',       '#f5f5f5');
    root.style.setProperty('--skeleton-from',  '#efefef');
    root.style.setProperty('--skeleton-to',    '#e2e2e2');
  }
}

export function applyTheme(theme: Partial<ThemeValues>): void {
  const root = document.documentElement;
  if (theme.accent     !== undefined) root.style.setProperty('--accent',      theme.accent);
  if (theme.accentText !== undefined) root.style.setProperty('--accent-text', theme.accentText);
  if (theme.pageBg     !== undefined) root.style.setProperty('--page-bg',     theme.pageBg);
  if (theme.cardBg     !== undefined) root.style.setProperty('--card-bg',     theme.cardBg);
  if (theme.sidebarBg  !== undefined) root.style.setProperty('--sidebar-bg',  theme.sidebarBg);

  const cardBg = theme.cardBg ?? root.style.getPropertyValue('--card-bg');
  _applyTextMode(_isDarkColor(cardBg));
}

const THEME_KEY = 'sc_tema';

export function saveThemeToStorage(theme: ThemeValues): void {
  try { localStorage.setItem(THEME_KEY, JSON.stringify(theme)); } catch { /* silent */ }
}

export function initThemeDefaults(): void {
  _applyTextMode(false);
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) { applyTheme(JSON.parse(saved)); return; }
  } catch { /* silent */ }
  applyTheme(DEFAULT_THEME);
}

export const colors = {
  pageBg:   'var(--page-bg,   #f5f5f5)',
  cardBg:   'var(--card-bg,   #ffffff)',
  rowHover: 'var(--row-hover, #fafafa)',
  inputBg:  'var(--input-bg,  #f5f5f5)',
  mutedBg:  'var(--input-bg,  #f0f0f0)',
  textPrimary:   'var(--text-primary,   #111111)',
  textSecondary: 'var(--text-secondary, #444444)',
  textMuted:     'var(--text-muted,     #9b9b9b)',
  border:      'var(--border,       #e5e5e5)',
  borderLight: 'var(--border-light, #f0f0f0)',
  accent:     'var(--accent,      #111111)',
  accentText: 'var(--accent-text, #ffffff)',
  sidebarBg: 'var(--sidebar-bg, #ffffff)',
  danger:       '#ef4444',
  dangerBg:     '#fef2f2',
  dangerBorder: '#fca5a5',
  dangerText:   '#dc2626',
  success:   '#10b981',
  successBg: 'rgba(16,185,129,0.1)',
} as const;

export const radius = { sm: '8px', md: '10px', lg: '16px', xl: '20px' } as const;
export const shadow = {
  card:  '0 1px 4px rgba(0,0,0,0.04)',
  modal: '0 24px 64px rgba(0,0,0,0.18)',
  hover: '0 12px 32px rgba(0,0,0,0.08)',
} as const;
