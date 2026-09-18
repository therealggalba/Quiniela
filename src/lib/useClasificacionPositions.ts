import { useEffect, useState } from 'react';
import { dbService } from '../dbService';
import { computeClasificacion, computeMaxAciertosPorJornada, type Jornada, type Player } from '../domain/quiniela';

interface QuinielaStats {
  /** Posición de cada jugador en la clasificación general (no depende de la jornada que se esté viendo). */
  posiciones: Map<string, number>;
  /** Máximo de aciertos conseguido en cada jornada (para el listado del histórico). */
  maxAciertosPorJornada: Map<string, number>;
}

export function useClasificacionPositions(players: Player[], jornadas: Jornada[]): QuinielaStats {
  const [stats, setStats] = useState<QuinielaStats>({ posiciones: new Map(), maxAciertosPorJornada: new Map() });

  useEffect(() => {
    if (players.length === 0 || jornadas.length === 0) return;
    let cancelled = false;
    async function load() {
      const [allColumnas, allPartidos] = await Promise.all([dbService.listAllColumnas(), dbService.listAllPartidos()]);
      if (cancelled) return;
      const rows = computeClasificacion(players, jornadas, allColumnas, allPartidos);
      setStats({
        posiciones: new Map(rows.map((r) => [r.playerId, r.position])),
        maxAciertosPorJornada: computeMaxAciertosPorJornada(jornadas, allColumnas, allPartidos),
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [players, jornadas]);

  return stats;
}
