export const TOKENS = {
  colors: {
    bgDark: '#05070A',
    bgPanel: 'rgba(10, 15, 23, 0.85)',
    bgPanelSolid: '#0B111A',
    bgCard: 'rgba(16, 24, 38, 0.75)',
    borderGlow: 'rgba(0, 243, 255, 0.3)',
    borderSubtle: 'rgba(255, 255, 255, 0.1)',
    
    // Status Cyber Colors
    neonCyan: '#00F3FF',
    neonEmerald: '#00FF9D',
    ambientAmber: '#FFB800',
    dangerCrimson: '#FF2A6D',
    purplePulse: '#A855F7',
    electricBlue: '#3B82F6',

    // Text
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textCyan: '#7EE7FC',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  elevation: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
    glowCyan: '0 0 20px rgba(0, 243, 255, 0.25)',
    glowEmerald: '0 0 20px rgba(0, 255, 157, 0.25)',
    glowAmber: '0 0 20px rgba(255, 184, 0, 0.25)',
    glowDanger: '0 0 20px rgba(255, 42, 109, 0.3)',
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    monoFont: "'JetBrains Mono', 'Fira Code', monospace",
  },
  transitions: {
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }
} as const
