export type Competicion = 'laliga' | 'segunda' | 'ligaf';
export type Signo = '1' | 'X' | '2';
export type EstadoJornada = 'abierta' | 'en_juego' | 'cerrada';
export type EstadoPartido = 'programado' | 'en_juego' | 'finalizado';

export const COMPETICION_LABEL: Record<Competicion, string> = {
  laliga: 'LaLiga',
  segunda: 'Segunda División',
  ligaf: 'Liga F',
};

/**
 * Rango de números de partido (orden dentro de la jornada) reservado a cada
 * competición, como en la quiniela oficial: 1-7 Primera, 8-10 Segunda,
 * 11-14 Liga F. Es solo una guía para el selector del admin, no se fuerza.
 */
export const COMPETICION_SLOT_RANGE: Record<Competicion, [number, number]> = {
  laliga: [1, 7],
  segunda: [8, 10],
  ligaf: [11, 14],
};

/** Jugadores habituales de la peña — plantilla para no tener que teclearlos cada vez. */
export const PRESET_PLAYERS = ['GMR', 'DCB', 'CRS', 'MPF', 'HRQ', 'AFM', 'YAB', 'CDS', 'JGL', 'DPF'];

/** Escala oficial del Pleno al 15: goles por equipo, con "M" = 3 o más. */
export type PlenoAl15Valor = '0' | '1' | '2' | 'M';
export const PLENO_AL_15_OPCIONES: PlenoAl15Valor[] = ['0', '1', '2', 'M'];

export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

export interface Jornada {
  id: string;
  numero: number;
  estado: EstadoJornada;
  createdAt: string;
  /**
   * Resultado oficial del Pleno al 15 de esta jornada (escala 0/1/2/M), el
   * mismo para toda la jornada aunque haya varios partidos marcados como
   * Pleno al 15 (son el mismo enfrentamiento duplicado para desempates con
   * más de 8 columnas) — se rellena una sola vez, no por partido.
   */
  plenoAl15Local: PlenoAl15Valor | null;
  plenoAl15Visitante: PlenoAl15Valor | null;
}

export interface Partido {
  id: string;
  jornadaId: string;
  orden: number;
  competicion: Competicion;
  equipoLocal: string;
  equipoVisitante: string;
  apiFixtureId: number | null;
  kickoffAt: string;
  estado: EstadoPartido;
  golesLocal: number | null;
  golesVisitante: number | null;
  /** Pleno al 15: el pronóstico es un marcador exacto, no un signo 1X2. */
  esPlenoAl15: boolean;
  updatedAt: string;
}

export interface Columna {
  id: string;
  jornadaId: string;
  playerId: string;
  /** Signo (1/X/2) para partidos normales, o "H-A" (marcador exacto) para Pleno al 15. */
  picks: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/** Signo real del partido, o null si aún no ha finalizado. */
export function signoReal(partido: Partido): Signo | null {
  if (partido.estado !== 'finalizado' || partido.golesLocal === null || partido.golesVisitante === null) {
    return null;
  }
  if (partido.golesLocal > partido.golesVisitante) return '1';
  if (partido.golesLocal < partido.golesVisitante) return '2';
  return 'X';
}

/**
 * true = acierto, false = fallo, null = partido aún sin resolver, sin
 * pronóstico, o es un partido de Pleno al 15 (esos no se colorean: se
 * muestra el marcador elegido tal cual, sin acierto/fallo).
 */
export function resultadoPick(partido: Partido, pick: string | undefined): boolean | null {
  if (partido.esPlenoAl15) return null;
  const real = signoReal(partido);
  if (real === null || !pick) return null;
  return pick === real;
}

export function contarAciertos(columna: Columna, partidos: Partido[]): number {
  return partidos.reduce((total, partido) => {
    const acierto = resultadoPick(partido, columna.picks[partido.id]);
    return acierto ? total + 1 : total;
  }, 0);
}

export interface ClasificacionRow {
  playerId: string;
  name: string;
  jornadasJugadas: number;
  jornadasGanadas: number;
  aciertosTotales: number;
  position: number;
}

/**
 * Calcula la clasificación general a partir de las jornadas ya cerradas.
 * Orden: aciertos totales desc -> jornadas ganadas desc -> jornadas jugadas asc.
 * Si varios jugadores empatan en aciertos dentro de una misma jornada, todos
 * cuentan como ganadores de esa jornada (no se especificó desempate a ese nivel).
 */
export function computeClasificacion(
  players: Player[],
  jornadas: Jornada[],
  columnas: Columna[],
  partidos: Partido[],
): ClasificacionRow[] {
  const jornadasCerradas = new Set(jornadas.filter((j) => j.estado === 'cerrada').map((j) => j.id));
  const partidosPorJornada = new Map<string, Partido[]>();
  for (const partido of partidos) {
    if (!jornadasCerradas.has(partido.jornadaId)) continue;
    const lista = partidosPorJornada.get(partido.jornadaId) ?? [];
    lista.push(partido);
    partidosPorJornada.set(partido.jornadaId, lista);
  }

  const stats = new Map<string, { jugadas: number; ganadas: number; aciertos: number }>();
  for (const player of players) {
    stats.set(player.id, { jugadas: 0, ganadas: 0, aciertos: 0 });
  }

  for (const jornadaId of jornadasCerradas) {
    const partidosJornada = partidosPorJornada.get(jornadaId) ?? [];
    const columnasJornada = columnas.filter((c) => c.jornadaId === jornadaId);
    if (columnasJornada.length === 0) continue;

    let maxAciertos = -1;
    const aciertosPorColumna = columnasJornada.map((columna) => {
      const aciertos = contarAciertos(columna, partidosJornada);
      maxAciertos = Math.max(maxAciertos, aciertos);
      return { columna, aciertos };
    });

    for (const { columna, aciertos } of aciertosPorColumna) {
      const entry = stats.get(columna.playerId);
      if (!entry) continue;
      entry.jugadas += 1;
      entry.aciertos += aciertos;
      if (aciertos === maxAciertos) entry.ganadas += 1;
    }
  }

  const rows = players
    .map((player) => {
      const entry = stats.get(player.id)!;
      return {
        playerId: player.id,
        name: player.name,
        jornadasJugadas: entry.jugadas,
        jornadasGanadas: entry.ganadas,
        aciertosTotales: entry.aciertos,
        position: 0,
      };
    })
    .sort((a, b) => {
      if (b.aciertosTotales !== a.aciertosTotales) return b.aciertosTotales - a.aciertosTotales;
      if (b.jornadasGanadas !== a.jornadasGanadas) return b.jornadasGanadas - a.jornadasGanadas;
      return a.jornadasJugadas - b.jornadasJugadas;
    });

  rows.forEach((row, index) => {
    row.position = index + 1;
  });

  return rows;
}
