import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { BottomNav } from './components/BottomNav';
import { LockIcon } from './components/icons';
import { AdminPage } from './pages/AdminPage';
import { Clasificacion } from './pages/Clasificacion';
import { Historico } from './pages/Historico';
import { Live } from './pages/Live';

// Esta app se despliega en dos sitios con rutas base distintas: /quiniela/
// dentro de GalbaHUB (vite.config.ts) y /Quiniela/ en GitHub Pages (build
// con --base=/Quiniela/, ver .github/workflows/deploy.yml). En vez de fijar
// un basename a mano (que solo valdría para uno de los dos), se deriva del
// BASE_URL que Vite ya resuelve en build a partir de --base o del config —
// así el router siempre coincide con la ruta real, sea cual sea el destino.
// Sin basename, react-router resolvería las rutas contra la raíz del
// dominio en vez de contra la subruta real. Mismo criterio que IASport.
const basename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

function Shell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Quiniela</h1>
        {!isAdmin && (
          <Link to="/admin" className="admin-entry" aria-label="Modo edición">
            <LockIcon />
          </Link>
        )}
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Live />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/clasificacion" element={<Clasificacion />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdmin && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Shell />
    </BrowserRouter>
  );
}

export default App;
