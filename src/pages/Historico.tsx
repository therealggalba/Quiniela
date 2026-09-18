import { useEffect, useState } from 'react';
import { QuinielaTable } from '../components/QuinielaTable';
import { dbService } from '../dbService';
import type { Columna, Jornada, Partido, Player } from '../domain/quiniela';
import { useClasificacionPositions } from '../lib/useClasificacionPositions';
import { useFavoritePlayer } from '../lib/useFavoritePlayer';

export function Historico() {
  const { favoritePlayerId, toggleFavorite } = useFavoritePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [jornadasCerradas, setJornadasCerradas] = useState<Jornada[]>([]);
  const [seleccionada, setSeleccionada] = useState<Jornada | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [columnas, setColumnas] = useState<Columna[]>([]);
  const [loading, setLoading] = useState(true);
  const { posiciones, maxAciertosPorJornada } = useClasificacionPositions(players, jornadasCerradas);

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
      <div>
        <div className="page" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingBottom: 0 }}>
          <button type="button" className="btn" onClick={() => setSeleccionada(null)}>
            ← Volver
          </button>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Jornada {seleccionada.numero}</h2>
        </div>
        <QuinielaTable
          players={players}
          columnas={columnas}
          partidos={partidos}
          favoritePlayerId={favoritePlayerId}
          onToggleFavorite={toggleFavorite}
          posiciones={posiciones}
        />
      </div>
    );
  }

  return (
    <div className="page">
      {jornadasCerradas.length === 0 ? (
        <div className="empty-state">Todavía no hay jornadas cerradas.</div>
      ) : (
        jornadasCerradas.map((jornada) => {
          const max = maxAciertosPorJornada.get(jornada.id);
          return (
            <button
              key={jornada.id}
              type="button"
              className="list-item"
              style={{ width: '100%', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => setSeleccionada(jornada)}
            >
              <span>Jornada {jornada.numero}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {max !== undefined && <span className="qt-stat-pill qt-stat-pill--aciertos">{max} aciertos</span>}
                <span className="badge-estado cerrada">cerrada</span>
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
