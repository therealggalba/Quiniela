import { useEffect, useState } from 'react';
import { QuinielaTable } from '../components/QuinielaTable';
import { dbService } from '../dbService';
import type { Columna, Jornada, Partido, Player } from '../domain/quiniela';
import { useClasificacionPositions } from '../lib/useClasificacionPositions';
import { useFavoritePlayer } from '../lib/useFavoritePlayer';

const LIVE_POLL_MS = 60_000;

function pickJornadaActual(jornadas: Jornada[]): Jornada | null {
  const enJuego = jornadas.find((j) => j.estado === 'en_juego');
  if (enJuego) return enJuego;
  const abiertas = jornadas.filter((j) => j.estado === 'abierta');
  if (abiertas.length > 0) return abiertas.sort((a, b) => b.numero - a.numero)[0];
  return jornadas.length > 0 ? jornadas.sort((a, b) => b.numero - a.numero)[0] : null;
}

export function Live() {
  const { favoritePlayerId, toggleFavorite } = useFavoritePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [jornada, setJornada] = useState<Jornada | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [columnas, setColumnas] = useState<Columna[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [loading, setLoading] = useState(true);
  const { posiciones } = useClasificacionPositions(players, jornadas);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [playersData, jornadasData] = await Promise.all([dbService.listPlayers(), dbService.listJornadas()]);
      if (cancelled) return;
      setPlayers(playersData);
      setJornadas(jornadasData);
      const actual = pickJornadaActual(jornadasData);
      setJornada(actual);
      if (actual) {
        const [partidosData, columnasData] = await Promise.all([
          dbService.listPartidos(actual.id),
          dbService.listColumnas(actual.id),
        ]);
        if (cancelled) return;
        setPartidos(partidosData);
        setColumnas(columnasData);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!jornada || jornada.estado !== 'en_juego' || !dbService.isRemote()) return;

    const interval = setInterval(async () => {
      try {
        await fetch('/api/quiniela-live');
      } catch {
        // La función edge no está disponible en local; el poll simplemente no refresca.
      }
      const partidosData = await dbService.listPartidos(jornada.id);
      setPartidos(partidosData);
    }, LIVE_POLL_MS);

    return () => clearInterval(interval);
  }, [jornada]);

  if (loading) return <div className="empty-state">Cargando…</div>;

  if (!jornada) {
    return <div className="empty-state">Todavía no hay ninguna jornada creada.</div>;
  }

  return (
    <div>
      <div className="page" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: 0 }}>
        <h2 style={{ margin: 0, fontSize: '1rem' }}>Jornada {jornada.numero}</h2>
        <span className={`badge-estado ${jornada.estado}`}>{jornada.estado.replace('_', ' ')}</span>
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
