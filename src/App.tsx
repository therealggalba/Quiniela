import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { BottomNav } from './components/BottomNav';
import { AdminPage } from './pages/AdminPage';
import { Clasificacion } from './pages/Clasificacion';
import { Historico } from './pages/Historico';
import { Live } from './pages/Live';

// En producción se sirve bajo /quiniela/ dentro de GalbaHUB: sin basename,
// react-router resolvería las rutas contra la raíz del dominio en vez de
// contra /quiniela/. Mismo criterio que IASport.
const basename = import.meta.env.DEV ? undefined : '/quiniela';

function Shell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Quiniela</h1>
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
