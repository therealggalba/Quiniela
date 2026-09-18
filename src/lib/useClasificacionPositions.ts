import { useEffect, useState } from 'react';
import { dbService } from '../dbService';
import { computeClasificacion, type Jornada, type Player } from '../domain/quiniela';

/** Posición de cada jugador en la clasificación general (no depende de la jornada que se esté viendo). */
export function useClasificacionPositions(players: Player[], jornadas: Jornada[]): Map<string, number> {
  const [positions, setPositions] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (players.length === 0 || jornadas.length === 0) return;
    let cancelled = false;
    async function load() {
      const [allColumnas, allPartidos] = await Promise.all([dbService.listAllColumnas(), dbService.listAllPartidos()]);
      if (cancelled) return;
      const rows = computeClasificacion(players, jornadas, allColumnas, allPartidos);
      setPositions(new Map(rows.map((r) => [r.playerId, r.position])));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [players, jornadas]);

  return positions;
}
