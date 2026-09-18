import { AdminDashboard } from './admin/AdminDashboard';
import { Login } from './admin/Login';
import { useSession } from '../lib/useSession';

export function AdminPage() {
  const { session, loading } = useSession();

  if (loading) return <div className="empty-state">Cargando…</div>;
  return session ? <AdminDashboard /> : <Login />;
}
