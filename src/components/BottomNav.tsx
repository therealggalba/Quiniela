import { NavLink } from 'react-router-dom';
import { HistoryIcon, LiveIcon, RankingIcon } from './icons';

const TABS = [
  { to: '/', label: 'En vivo', Icon: LiveIcon, end: true },
  { to: '/historico', label: 'Histórico', Icon: HistoryIcon, end: false },
  { to: '/clasificacion', label: 'Clasificación', Icon: RankingIcon, end: false },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon className="icon" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
