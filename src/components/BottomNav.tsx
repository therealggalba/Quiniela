import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'En vivo', icon: '⚽', end: true },
  { to: '/historico', label: 'Histórico', icon: '📅', end: false },
  { to: '/clasificacion', label: 'Clasificación', icon: '🏆', end: false },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
