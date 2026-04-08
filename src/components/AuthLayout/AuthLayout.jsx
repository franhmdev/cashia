import styles from './AuthLayout.module.scss'

// â”€â”€â”€ Datos mock del feed bancario â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TRANSACTIONS = [
  { icon: 'ðŸ›’', label: 'Supermercado',  sub: 'Hoy, 10:24',  amount: '-$42.50',  color: '#ef4444', up: false },
  { icon: '💸', label: 'Transferencia', sub: 'Hoy, 09:05',  amount: '+$300.00', color: '#10b981', up: true  },
  { icon: 'ðŸ”', label: 'Rappi',         sub: 'Ayer, 19:40', amount: '-$18.90',  color: '#ef4444', up: false },
  { icon: 'â›½', label: 'Gasolinera',    sub: 'Ayer, 14:12', amount: '-$55.00',  color: '#ef4444', up: false },
  { icon: 'ðŸ ', label: 'Arriendo',      sub: 'Abr 5',        amount: '-$800.00', color: '#ef4444', up: false },
]

// â”€â”€â”€ IlustraciÃ³n: Phone con feed bancario â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AuthIllustration() {
  const PW = 210; const PH = 420
  const PX = 120; const PY = 50
  const PR = 28
  const SX = PX + 10; const SY = PY + 14
  const SW = PW - 20; const SH = PH - 28
  const SR = 20

  return (
    <svg
      viewBox="0 0 450 520"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Feed de movimientos bancarios"
      className={styles['auth-illustration']}
    >
      <defs>
        <linearGradient id="sBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1e1b4b" />
          <stop offset="30%"  stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <filter id="phoneShadow" x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <clipPath id="screenClip">
          <rect x={SX} y={SY} width={SW} height={SH} rx={SR} />
        </clipPath>
      </defs>

      {/* DecoraciÃ³n de fondo del panel */}
      <circle cx="50"  cy="60"  r="70" fill="rgba(255,255,255,0.05)" />
      <circle cx="400" cy="460" r="90" fill="rgba(255,255,255,0.05)" />
      <circle cx="420" cy="90"  r="50" fill="rgba(255,255,255,0.04)" />

      {/* Phone frame */}
      <rect x={PX} y={PY} width={PW} height={PH} rx={PR}
        fill="#0f0e1a" filter="url(#phoneShadow)" />
      <rect x={PX} y={PY} width={PW} height={PH} rx={PR}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

      {/* Dynamic island */}
      <rect x="196" y={PY + 8} width="58" height="10" rx="5" fill="#0a0918" />

      {/* Botones laterales */}
      <rect x={PX - 3}      y={PY + 80}  width="4" height="30" rx="2" fill="#1a1829" />
      <rect x={PX - 3}      y={PY + 120} width="4" height="50" rx="2" fill="#1a1829" />
      <rect x={PX + PW - 1} y={PY + 100} width="4" height="40" rx="2" fill="#1a1829" />

      {/* Pantalla fondo */}
      <rect x={SX} y={SY} width={SW} height={SH} rx={SR} fill="url(#sBg)" />

      <g clipPath="url(#screenClip)">
        {/* Status bar */}
        <text x={SX + 10} y={SY + 16} fontSize="7.5" fill="rgba(255,255,255,0.7)"
          fontFamily="system-ui,sans-serif" fontWeight="600">9:41</text>
        <rect x={SX + SW - 28} y={SY + 7}  width="20" height="9" rx="2"
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
        <rect x={SX + SW - 7}  y={SY + 10} width="2"  height="3" rx="0.5"
          fill="rgba(255,255,255,0.5)" />
        <rect x={SX + SW - 27} y={SY + 8}  width="14" height="7" rx="1.5" fill="#10b981" />

        {/* Header */}
        <text x={SX + 12} y={SY + 35} fontSize="9.5" fill="rgba(255,255,255,0.55)"
          fontFamily="system-ui,sans-serif">Bienvenido ðŸ‘‹</text>
        <text x={SX + 12} y={SY + 49} fontSize="12" fill="#ffffff"
          fontFamily="system-ui,sans-serif" fontWeight="700">Carlos Mendoza</text>
        <circle cx={SX + SW - 20} cy={SY + 42} r="13" fill="#7c3aed" opacity="0.7" />
        <text x={SX + SW - 20} y={SY + 46} fontSize="10" textAnchor="middle"
          fill="white" fontFamily="system-ui,sans-serif" fontWeight="700">CM</text>

        {/* Tarjeta balance */}
        <rect x={SX + 10} y={SY + 60} width={SW - 20} height="88" rx="14"
          fill="url(#cardGrad)" />
        <circle cx={SX + SW - 22} cy={SY + 80}  r="30" fill="rgba(255,255,255,0.10)" />
        <circle cx={SX + SW - 10} cy={SY + 122} r="22" fill="rgba(255,255,255,0.07)" />
        <rect x={SX + 20} y={SY + 73} width="18" height="13" rx="3"
          fill="rgba(255,230,0,0.75)" />
        <text x={SX + 20} y={SY + 102} fontSize="8.5" fill="rgba(255,255,255,0.65)"
          fontFamily="system-ui,sans-serif">Saldo disponible</text>
        <text x={SX + 20} y={SY + 118} fontSize="17" fill="#ffffff"
          fontFamily="system-ui,sans-serif" fontWeight="800">$4,238.50</text>
        <text x={SX + 20} y={SY + 136} fontSize="7" fill="rgba(255,255,255,0.45)"
          fontFamily="monospace" letterSpacing="2">â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 4821</text>

        {/* Acciones rÃ¡pidas */}
        {[
          { icon: 'â†‘', label: 'Enviar',  cx: SX + 30  },
          { icon: 'â†“', label: 'Recibir', cx: SX + 72  },
          { icon: 'âŸ³', label: 'Recarga', cx: SX + 114 },
          { icon: 'â‹¯', label: 'MÃ¡s',     cx: SX + 156 },
        ].map(({ icon, label, cx }) => (
          <g key={label}>
            <circle cx={cx} cy={SY + 170} r="16" fill="rgba(255,255,255,0.09)" />
            <text x={cx} y={SY + 174} fontSize="11" textAnchor="middle"
              fill="rgba(255,255,255,0.85)" fontFamily="system-ui,sans-serif">{icon}</text>
            <text x={cx} y={SY + 191} fontSize="7" textAnchor="middle"
              fill="rgba(255,255,255,0.5)" fontFamily="system-ui,sans-serif">{label}</text>
          </g>
        ))}

        {/* TÃ­tulo movimientos */}
        <text x={SX + 12} y={SY + 212} fontSize="9.5" fill="#ffffff"
          fontFamily="system-ui,sans-serif" fontWeight="700">Ãšltimos movimientos</text>
        <text x={SX + SW - 12} y={SY + 212} fontSize="8" textAnchor="end"
          fill="#a78bfa" fontFamily="system-ui,sans-serif">Ver todos</text>
        <line x1={SX + 12} y1={SY + 217} x2={SX + SW - 12} y2={SY + 217}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* Transacciones */}
        {TRANSACTIONS.map(({ icon, label, sub, amount, color, up }, i) => {
          const ty = SY + 230 + i * 40
          return (
            <g key={label + i}>
              {i % 2 === 0 && (
                <rect x={SX + 8} y={ty - 12} width={SW - 16} height="36" rx="8"
                  fill="rgba(255,255,255,0.03)" />
              )}
              <circle cx={SX + 24} cy={ty + 6} r="13" fill="rgba(255,255,255,0.07)" />
              <text x={SX + 24} y={ty + 10} fontSize="11" textAnchor="middle"
                fontFamily="system-ui,sans-serif">{icon}</text>
              <text x={SX + 44} y={ty + 3} fontSize="9" fill="#f8fafc"
                fontFamily="system-ui,sans-serif" fontWeight="600">{label}</text>
              <text x={SX + 44} y={ty + 14} fontSize="7.5" fill="rgba(255,255,255,0.4)"
                fontFamily="system-ui,sans-serif">{sub}</text>
              <text x={SX + SW - 14} y={ty + 5} fontSize="9.5" textAnchor="end"
                fill={color} fontFamily="system-ui,sans-serif" fontWeight="700">{amount}</text>
              <text x={SX + SW - 14} y={ty + 16} fontSize="7.5" textAnchor="end"
                fill="rgba(255,255,255,0.2)" fontFamily="system-ui,sans-serif">
                {up ? 'â–²' : 'â–¼'}
              </text>
            </g>
          )
        })}

        {/* Bottom nav */}
        <rect x={SX} y={SY + SH - 44} width={SW} height="44"
          fill="rgba(15,14,26,0.92)" />
        <line x1={SX} y1={SY + SH - 44} x2={SX + SW} y2={SY + SH - 44}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {[
          { icon: 'âŒ‚', active: true,  big: false, cx: SX + SW * 0.15 },
          { icon: 'ðŸ“Š', active: false, big: false, cx: SX + SW * 0.38 },
          { icon: 'ï¼‹', active: false, big: true,  cx: SX + SW * 0.50 },
          { icon: 'ðŸ””', active: false, big: false, cx: SX + SW * 0.65 },
          { icon: 'â˜°',  active: false, big: false, cx: SX + SW * 0.85 },
        ].map(({ icon, active, big, cx }) => (
          <g key={cx}>
            {big && <circle cx={cx} cy={SY + SH - 22} r="16" fill="#7c3aed" />}
            <text x={cx} y={SY + SH - 17} fontSize={big ? '13' : '11'}
              textAnchor="middle"
              fill={active ? '#a78bfa' : big ? '#fff' : 'rgba(255,255,255,0.4)'}
              fontFamily="system-ui,sans-serif">{icon}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

// â”€â”€â”€ AuthLayout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function AuthLayout({ children }) {
  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-layout']}>
        <div className={styles['auth-layout__form']}>
          {children}
        </div>
        <div className={styles['auth-layout__visual']} aria-hidden="true">
          <AuthIllustration />
        </div>
      </div>
    </div>
  )
}
