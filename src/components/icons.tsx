interface IconProps {
  className?: string;
}

/** Icono sobrio y monocromo (sin relleno de color) para "En vivo". */
export function LiveIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="10" cy="12.5" r="2.2" fill="currentColor" />
      <path d="M6.7 9.3a4.6 4.6 0 0 1 6.6 0M4.3 6.6a8.3 8.3 0 0 1 11.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Icono sobrio y monocromo para "Histórico". */
export function HistoryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="10" cy="10" r="7.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.2v4l2.8 1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Icono sobrio y monocromo para "Clasificación". */
export function RankingIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="12" width="3.1" height="5" rx="0.6" fill="currentColor" />
      <rect x="8.4" y="8" width="3.1" height="9" rx="0.6" fill="currentColor" />
      <rect x="13.8" y="4" width="3.1" height="13" rx="0.6" fill="currentColor" />
    </svg>
  );
}

/** Candado del acceso a modo edición: pensado para camuflarse con el fondo. */
export function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
