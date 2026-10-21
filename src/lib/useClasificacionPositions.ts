import { useEffect, useState } from 'react';
import { dbService } from '../dbService';
import {
  computeClasificacion,
  computeGanadoresPorJornada,
  type GanadoresJornada,
  type Jornada,
  type Player,
} from '../domain/quiniela';

interface QuinielaStats {
  /** Posición de cada jugador en la clasificación general (no depende de la jornada que se esté viendo). */
  posiciones: Map<string, number>;
  /** Ganador(es) y máximo de aciertos de cada jornada (para el listado del histórico). */
  ganadoresPorJornada: Map<string, GanadoresJornada>;
}

export function useClasificacionPositions(players: Player[], jornadas: Jornada[]): QuinielaStats {
  const [stats, setStats] = useState<QuinielaStats>({ posiciones: new Map(), ganadoresPorJornada: new Map() });

  useEffect(() => {
    if (players.length === 0 || jornadas.length === 0) return;
    let cancelled = false;
    async function load() {
      const [allColumnas, allPartidos] = await Promise.all([dbService.listAllColumnas(), dbService.listAllPartidos()]);
      if (cancelled) return;
      const rows = computeClasificacion(players, jornadas, allColumnas, allPartidos);
      setStats({
        posiciones: new Map(rows.map((r) => [r.playerId, r.position])),
        ganadoresPorJornada: computeGanadoresPorJornada(jornadas, allColumnas, allPartidos),
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [players, jornadas]);

  return stats;
}
