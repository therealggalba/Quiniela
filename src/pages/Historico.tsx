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
  const { posiciones, ganadoresPorJornada } = useClasificacionPositions(players, jornadasCerradas);

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
    const jugadoresJornada = players.filter((p) => columnas.some((c) => c.playerId === p.id));
    return (
      <div className="screen">
        <div className="page screen__title">
          <button type="button" className="btn" onClick={() => setSeleccionada(null)}>
            ← Volver
          </button>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Jornada {seleccionada.numero}</h2>
        </div>
        <QuinielaTable
          players={jugadoresJornada}
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
          const ganadores = ganadoresPorJornada.get(jornada.id);
          const nombres = ganadores
            ? ganadores.playerIds.map((id) => players.find((p) => p.id === id)?.name).filter(Boolean)
            : [];
          return (
            <button
              key={jornada.id}
              type="button"
              className="list-item list-item--button"
              onClick={() => setSeleccionada(jornada)}
            >
              <span className="list-item__main">
                <span>Jornada {jornada.numero}</span>
                {nombres.length > 0 && (
                  <span className="list-item__winner">
                    {nombres.length > 1 ? 'Ganaron' : 'Ganó'} {nombres.join(' · ')}
                  </span>
                )}
              </span>
              <span className="list-item__meta">
                {ganadores && <span className="qt-stat-pill qt-stat-pill--aciertos">{ganadores.aciertos} aciertos</span>}
                <span className="badge-estado cerrada">cerrada</span>
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
