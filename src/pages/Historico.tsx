import { useEffect, useState } from 'react';
import { ColumnaCarousel } from '../components/ColumnaCarousel';
import { dbService } from '../dbService';
import type { Columna, Jornada, Partido, Player } from '../domain/quiniela';
import { useFavoritePlayer } from '../lib/useFavoritePlayer';

export function Historico() {
  const { favoritePlayerId, toggleFavorite } = useFavoritePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [jornadasCerradas, setJornadasCerradas] = useState<Jornada[]>([]);
  const [seleccionada, setSeleccionada] = useState<Jornada | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [columnas, setColumnas] = useState<Columna[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [playersData, jornadasData] = await Promise.all([dbService.listPlayers(), dbService.listJornadas()]);
      setPlayers(playersData);
      const cerradas = jornadasData.filter((j) => j.estado === 'cerrada').sort((a, b) => b.numero - a.numero);
      setJornadasCerradas(cerradas);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!seleccionada) return;
    let cancelled = false;
    async function loadJornada() {
      const [partidosData, columnasData] = await Promise.all([
        dbService.listPartidos(seleccionada!.id),
        dbService.listColumnas(seleccionada!.id),
      ]);
      if (cancelled) return;
      setPartidos(partidosData);
      setColumnas(columnasData);
    }
    loadJornada();
    return () => {
      cancelled = true;
    };
  }, [seleccionada]);

  if (loading) return <div className="empty-state">Cargando…</div>;

  if (seleccionada) {
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <button type="button" className="btn" onClick={() => setSeleccionada(null)}>
            ← Volver
          </button>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Jornada {seleccionada.numero}</h2>
        </div>
        <ColumnaCarousel
          players={players}
          columnas={columnas}
          partidos={partidos}
          favoritePlayerId={favoritePlayerId}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    );
  }

  return (
    <div className="page">
      {jornadasCerradas.length === 0 ? (
        <div className="empty-state">Todavía no hay jornadas cerradas.</div>
      ) : (
        jornadasCerradas.map((jornada) => (
          <button
            key={jornada.id}
            type="button"
            className="list-item"
            style={{ width: '100%', border: '1px solid var(--border)', cursor: 'pointer' }}
            onClick={() => setSeleccionada(jornada)}
          >
            <span>Jornada {jornada.numero}</span>
            <span className="badge-estado cerrada">cerrada</span>
          </button>
        ))
      )}
    </div>
  );
}
