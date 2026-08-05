export const THEME = {
  colors: {
    red: '#CC0000',
    redDark: '#990000',
    redLight: '#E53333',
    redGlow: 'rgba(204, 0, 0, 0.15)',
    white: '#FFFFFF',
    offWhite: '#F8F8F8',
    charcoal: '#1E1E1E',
    charcoalMid: '#2E2E2E',
    charcoalLight: '#3A3A3A',
    slate: '#4B4B4B',
    muted: '#888888',
    borderLight: 'rgba(255,255,255,0.12)',
    borderMedium: 'rgba(255,255,255,0.2)',

    // Status Colors
    aprovado: '#00C060',
    aprovadoBg: 'rgba(0, 192, 96, 0.15)',
    atencao: '#FFB800',
    atencaoBg: 'rgba(255, 184, 0, 0.15)',
    reprovado: '#FF3A3A',
    reprovadoBg: 'rgba(255, 58, 58, 0.15)',
    bloqueado: '#444444',
    bloqueadoBg: 'rgba(68, 68, 68, 0.25)',
  },
  status: {
    APROVADO: { color: '#00C060', bg: 'rgba(0, 192, 96, 0.15)', border: 'rgba(0, 192, 96, 0.4)', label: 'Aprovado' },
    ATENCAO:  { color: '#FFB800', bg: 'rgba(255, 184, 0, 0.15)',  border: 'rgba(255, 184, 0, 0.4)',  label: 'Atenção' },
    REPROVADO:{ color: '#FF3A3A', bg: 'rgba(255, 58, 58, 0.15)',  border: 'rgba(255, 58, 58, 0.4)',  label: 'Reprovado' },
    BLOQUEADO:{ color: '#888888', bg: 'rgba(68, 68, 68, 0.25)',   border: 'rgba(68, 68, 68, 0.5)',   label: 'Bloqueado' },
  },
} as const
