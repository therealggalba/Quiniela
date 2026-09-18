import { supabase } from './lib/supabaseClient';
import type { Columna, EstadoJornada, Jornada, Partido, Player } from './domain/quiniela';

const LOCAL_STORAGE_KEY = 'quiniela_state_v1';

interface LocalState {
  players: Player[];
  jornadas: Jornada[];
  partidos: Partido[];
  columnas: Columna[];
}

function emptyState(): LocalState {
  return { players: [], jornadas: [], partidos: [], columnas: [] };
}

function getLocalState(): LocalState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedDemoState();
  } catch (e) {
    console.error('Error leyendo el estado local de la quiniela', e);
    return emptyState();
  }
}

function saveLocalState(state: LocalState) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error guardando el estado local de la quiniela', e);
  }
}

/**
 * Sin conexión a Supabase configurada (dev local sin credenciales), se
 * siembra una jornada de ejemplo para poder ver y probar la interfaz.
 */
function seedDemoState(): LocalState {
  const now = new Date().toISOString();
  const players: Player[] = [
    { id: 'p1', name: 'Gonzalo', createdAt: now },
    { id: 'p2', name: 'Marta', createdAt: now },
    { id: 'p3', name: 'Iván', createdAt: now },
  ];
  const jornadaLive: Jornada = { id: 'j2', numero: 2, estado: 'en_juego', createdAt: now };
  const jornadaClosed: Jornada = { id: 'j1', numero: 1, estado: 'cerrada', createdAt: now };

  const partidosLive: Partido[] = [
    { id: 'm1', jornadaId: 'j2', orden: 1, competicion: 'laliga', equipoLocal: 'Real Madrid', equipoVisitante: 'Betis', apiFixtureId: null, kickoffAt: now, estado: 'finalizado', golesLocal: 2, golesVisitante: 0, esPlenoAl15: false, plenoAl15Local: null, plenoAl15Visitante: null, updatedAt: now },
    { id: 'm2', jornadaId: 'j2', orden: 2, competicion: 'laliga', equipoLocal: 'Barcelona', equipoVisitante: 'Sevilla', apiFixtureId: null, kickoffAt: now, estado: 'en_juego', golesLocal: 1, golesVisitante: 1, esPlenoAl15: false, plenoAl15Local: null, plenoAl15Visitante: null, updatedAt: now },
    { id: 'm3', jornadaId: 'j2', orden: 3, competicion: 'segunda', equipoLocal: 'Racing', equipoVisitante: 'Deportivo', apiFixtureId: null, kickoffAt: now, estado: 'programado', golesLocal: null, golesVisitante: null, esPlenoAl15: false, plenoAl15Local: null, plenoAl15Visitante: null, updatedAt: now },
    { id: 'm4', jornadaId: 'j2', orden: 4, competicion: 'ligaf', equipoLocal: 'Atlético', equipoVisitante: 'Levante', apiFixtureId: null, kickoffAt: now, estado: 'programado', golesLocal: null, golesVisitante: null, esPlenoAl15: false, plenoAl15Local: null, plenoAl15Visitante: null, updatedAt: now },
  ];
  const partidosClosed: Partido[] = [
    { id: 'm5', jornadaId: 'j1', orden: 1, competicion: 'laliga', equipoLocal: 'Valencia', equipoVisitante: 'Villarreal', apiFixtureId: null, kickoffAt: now, estado: 'finalizado', golesLocal: 1, golesVisitante: 1, esPlenoAl15: false, plenoAl15Local: null, plenoAl15Visitante: null, updatedAt: now },
    { id: 'm6', jornadaId: 'j1', orden: 2, competicion: 'segunda', equipoLocal: 'Málaga', equipoVisitante: 'Elche', apiFixtureId: null, kickoffAt: now, estado: 'finalizado', golesLocal: 0, golesVisitante: 2, esPlenoAl15: false, plenoAl15Local: null, plenoAl15Visitante: null, updatedAt: now },
    { id: 'm7', jornadaId: 'j1', orden: 3, competicion: 'laliga', equipoLocal: 'Atlético', equipoVisitante: 'Real Madrid', apiFixtureId: null, kickoffAt: now, estado: 'finalizado', golesLocal: null, golesVisitante: null, esPlenoAl15: true, plenoAl15Local: '2', plenoAl15Visitante: '1', updatedAt: now },
    { id: 'm8', jornadaId: 'j1', orden: 4, competicion: 'laliga', equipoLocal: 'Atlético', equipoVisitante: 'Real Madrid', apiFixtureId: null, kickoffAt: now, estado: 'finalizado', golesLocal: null, golesVisitante: null, esPlenoAl15: true, plenoAl15Local: 'M', plenoAl15Visitante: '0', updatedAt: now },
  ];

  const columnas: Columna[] = [
    { id: 'c1', jornadaId: 'j2', playerId: 'p1', picks: { m1: '1', m2: 'X', m3: '1', m4: '2' }, createdAt: now, updatedAt: now },
    { id: 'c2', jornadaId: 'j2', playerId: 'p2', picks: { m1: '1', m2: '1', m3: 'X', m4: '1' }, createdAt: now, updatedAt: now },
    { id: 'c3', jornadaId: 'j2', playerId: 'p3', picks: { m1: 'X', m2: 'X', m3: '2', m4: '2' }, createdAt: now, updatedAt: now },
    { id: 'c4', jornadaId: 'j1', playerId: 'p1', picks: { m5: 'X', m6: '2' }, createdAt: now, updatedAt: now },
    { id: 'c5', jornadaId: 'j1', playerId: 'p2', picks: { m5: '1', m6: '2' }, createdAt: now, updatedAt: now },
    { id: 'c6', jornadaId: 'j1', playerId: 'p3', picks: { m5: 'X', m6: '1' }, createdAt: now, updatedAt: now },
  ];

  const state: LocalState = {
    players,
    jornadas: [jornadaLive, jornadaClosed],
    partidos: [...partidosLive, ...partidosClosed],
    columnas,
  };
  saveLocalState(state);
  return state;
}

function rowToPlayer(row: any): Player {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

function rowToJornada(row: any): Jornada {
  return { id: row.id, numero: row.numero, estado: row.estado, createdAt: row.created_at };
}

function rowToPartido(row: any): Partido {
  return {
    id: row.id,
    jornadaId: row.jornada_id,
    orden: row.orden,
    competicion: row.competicion,
    equipoLocal: row.equipo_local,
    equipoVisitante: row.equipo_visitante,
    apiFixtureId: row.api_fixture_id,
    kickoffAt: row.kickoff_at,
    estado: row.estado,
    golesLocal: row.goles_local,
    golesVisitante: row.goles_visitante,
    esPlenoAl15: row.es_pleno_al_15 ?? false,
    plenoAl15Local: row.pleno_al_15_local ?? null,
    plenoAl15Visitante: row.pleno_al_15_visitante ?? null,
    updatedAt: row.updated_at,
  };
}

function rowToColumna(row: any): Columna {
  return {
    id: row.id,
    jornadaId: row.jornada_id,
    playerId: row.player_id,
    picks: row.picks ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const dbService = {
  isRemote(): boolean {
    return supabase !== null;
  },

  async listPlayers(): Promise<Player[]> {
    if (!supabase) return getLocalState().players.sort((a, b) => a.name.localeCompare(b.name));
    const { data, error } = await supabase.from('quiniela_players').select('*').order('name');
    if (error) {
      console.warn('Supabase listPlayers falló, usando estado local:', error.message);
      return getLocalState().players.sort((a, b) => a.name.localeCompare(b.name));
    }
    return (data ?? []).map(rowToPlayer);
  },

  async createPlayer(name: string): Promise<Player> {
    if (!supabase) {
      const state = getLocalState();
      const player: Player = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
      state.players.push(player);
      saveLocalState(state);
      return player;
    }
    const { data, error } = await supabase.from('quiniela_players').insert({ name }).select().single();
    if (error) throw error;
    return rowToPlayer(data);
  },

  async listJornadas(): Promise<Jornada[]> {
    if (!supabase) return getLocalState().jornadas.sort((a, b) => b.numero - a.numero);
    const { data, error } = await supabase.from('quiniela_jornadas').select('*').order('numero', { ascending: false });
    if (error) {
      console.warn('Supabase listJornadas falló, usando estado local:', error.message);
      return getLocalState().jornadas.sort((a, b) => b.numero - a.numero);
    }
    return (data ?? []).map(rowToJornada);
  },

  async createJornada(numero: number): Promise<Jornada> {
    if (!supabase) {
      const state = getLocalState();
      const jornada: Jornada = { id: crypto.randomUUID(), numero, estado: 'abierta', createdAt: new Date().toISOString() };
      state.jornadas.push(jornada);
      saveLocalState(state);
      return jornada;
    }
    const { data, error } = await supabase.from('quiniela_jornadas').insert({ numero, estado: 'abierta' }).select().single();
    if (error) throw error;
    return rowToJornada(data);
  },

  async setJornadaEstado(id: string, estado: EstadoJornada): Promise<void> {
    if (!supabase) {
      const state = getLocalState();
      const jornada = state.jornadas.find((j) => j.id === id);
      if (jornada) jornada.estado = estado;
      saveLocalState(state);
      return;
    }
    const { error } = await supabase.from('quiniela_jornadas').update({ estado }).eq('id', id);
    if (error) throw error;
  },

  async listPartidos(jornadaId: string): Promise<Partido[]> {
    if (!supabase) {
      return getLocalState()
        .partidos.filter((p) => p.jornadaId === jornadaId)
        .sort((a, b) => a.orden - b.orden);
    }
    const { data, error } = await supabase
      .from('quiniela_partidos')
      .select('*')
      .eq('jornada_id', jornadaId)
      .order('orden');
    if (error) {
      console.warn('Supabase listPartidos falló, usando estado local:', error.message);
      return getLocalState()
        .partidos.filter((p) => p.jornadaId === jornadaId)
        .sort((a, b) => a.orden - b.orden);
    }
    return (data ?? []).map(rowToPartido);
  },

  async listAllPartidos(): Promise<Partido[]> {
    if (!supabase) return getLocalState().partidos;
    const { data, error } = await supabase.from('quiniela_partidos').select('*');
    if (error) {
      console.warn('Supabase listAllPartidos falló, usando estado local:', error.message);
      return getLocalState().partidos;
    }
    return (data ?? []).map(rowToPartido);
  },

  async createPartido(input: Omit<Partido, 'id' | 'updatedAt'>): Promise<Partido> {
    if (!supabase) {
      const state = getLocalState();
      const partido: Partido = { ...input, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
      state.partidos.push(partido);
      saveLocalState(state);
      return partido;
    }
    const { data, error } = await supabase
      .from('quiniela_partidos')
      .insert({
        jornada_id: input.jornadaId,
        orden: input.orden,
        competicion: input.competicion,
        equipo_local: input.equipoLocal,
        equipo_visitante: input.equipoVisitante,
        api_fixture_id: input.apiFixtureId,
        kickoff_at: input.kickoffAt,
        estado: input.estado,
        goles_local: input.golesLocal,
        goles_visitante: input.golesVisitante,
        es_pleno_al_15: input.esPlenoAl15,
        pleno_al_15_local: input.plenoAl15Local,
        pleno_al_15_visitante: input.plenoAl15Visitante,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToPartido(data);
  },

  async updatePartido(id: string, patch: Partial<Omit<Partido, 'id' | 'jornadaId'>>): Promise<void> {
    if (!supabase) {
      const state = getLocalState();
      const partido = state.partidos.find((p) => p.id === id);
      if (partido) Object.assign(partido, patch, { updatedAt: new Date().toISOString() });
      saveLocalState(state);
      return;
    }
    const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.orden !== undefined) dbPatch.orden = patch.orden;
    if (patch.competicion !== undefined) dbPatch.competicion = patch.competicion;
    if (patch.equipoLocal !== undefined) dbPatch.equipo_local = patch.equipoLocal;
    if (patch.equipoVisitante !== undefined) dbPatch.equipo_visitante = patch.equipoVisitante;
    if (patch.apiFixtureId !== undefined) dbPatch.api_fixture_id = patch.apiFixtureId;
    if (patch.kickoffAt !== undefined) dbPatch.kickoff_at = patch.kickoffAt;
    if (patch.estado !== undefined) dbPatch.estado = patch.estado;
    if (patch.golesLocal !== undefined) dbPatch.goles_local = patch.golesLocal;
    if (patch.golesVisitante !== undefined) dbPatch.goles_visitante = patch.golesVisitante;
    if (patch.esPlenoAl15 !== undefined) dbPatch.es_pleno_al_15 = patch.esPlenoAl15;
    if (patch.plenoAl15Local !== undefined) dbPatch.pleno_al_15_local = patch.plenoAl15Local;
    if (patch.plenoAl15Visitante !== undefined) dbPatch.pleno_al_15_visitante = patch.plenoAl15Visitante;
    const { error } = await supabase.from('quiniela_partidos').update(dbPatch).eq('id', id);
    if (error) throw error;
  },

  async deletePartido(id: string): Promise<void> {
    if (!supabase) {
      const state = getLocalState();
      state.partidos = state.partidos.filter((p) => p.id !== id);
      saveLocalState(state);
      return;
    }
    const { error } = await supabase.from('quiniela_partidos').delete().eq('id', id);
    if (error) throw error;
  },

  async listColumnas(jornadaId: string): Promise<Columna[]> {
    if (!supabase) return getLocalState().columnas.filter((c) => c.jornadaId === jornadaId);
    const { data, error } = await supabase.from('quiniela_columnas').select('*').eq('jornada_id', jornadaId);
    if (error) {
      console.warn('Supabase listColumnas falló, usando estado local:', error.message);
      return getLocalState().columnas.filter((c) => c.jornadaId === jornadaId);
    }
    return (data ?? []).map(rowToColumna);
  },

  async listAllColumnas(): Promise<Columna[]> {
    if (!supabase) return getLocalState().columnas;
    const { data, error } = await supabase.from('quiniela_columnas').select('*');
    if (error) {
      console.warn('Supabase listAllColumnas falló, usando estado local:', error.message);
      return getLocalState().columnas;
    }
    return (data ?? []).map(rowToColumna);
  },

  async upsertColumna(jornadaId: string, playerId: string, picks: Record<string, string>): Promise<Columna> {
    if (!supabase) {
      const state = getLocalState();
      const existing = state.columnas.find((c) => c.jornadaId === jornadaId && c.playerId === playerId);
      const now = new Date().toISOString();
      if (existing) {
        existing.picks = picks;
        existing.updatedAt = now;
        saveLocalState(state);
        return existing;
      }
      const columna: Columna = { id: crypto.randomUUID(), jornadaId, playerId, picks, createdAt: now, updatedAt: now };
      state.columnas.push(columna);
      saveLocalState(state);
      return columna;
    }
    const { data: existing, error: findError } = await supabase
      .from('quiniela_columnas')
      .select('id')
      .eq('jornada_id', jornadaId)
      .eq('player_id', playerId)
      .maybeSingle();
    if (findError) throw findError;

    if (existing) {
      const { data, error } = await supabase
        .from('quiniela_columnas')
        .update({ picks, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return rowToColumna(data);
    }
    const { data, error } = await supabase
      .from('quiniela_columnas')
      .insert({ jornada_id: jornadaId, player_id: playerId, picks })
      .select()
      .single();
    if (error) throw error;
    return rowToColumna(data);
  },

  /** DDL para pegar una vez en el editor SQL de Supabase. */
  getDDL(): string {
    return `
-- Jugadores de la quiniela
CREATE TABLE IF NOT EXISTS public.quiniela_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jornadas
CREATE TABLE IF NOT EXISTS public.quiniela_jornadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'en_juego', 'cerrada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Partidos de cada jornada (1ª, 2ª y Liga F mezclados). "orden" fija el
-- número de partido dentro de la jornada (1-7 Primera, 8-10 Segunda,
-- 11-14 Liga F, como en la quiniela oficial) y es lo que decide el orden
-- de aparición en pantalla, no la hora de inicio.
-- pleno_al_15_local/visitante: escala oficial 0/1/2/M (M = 3+ goles). Con
-- más de 8 columnas puede haber varios partidos es_pleno_al_15 en la misma
-- jornada (mismo enfrentamiento real duplicado: mismo equipo/hora), pero
-- CADA UNO tiene su propio resultado independiente — no cuentan para la
-- estadística de aciertos de ningún jugador.
CREATE TABLE IF NOT EXISTS public.quiniela_partidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jornada_id UUID NOT NULL REFERENCES public.quiniela_jornadas(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL DEFAULT 1,
    competicion TEXT NOT NULL CHECK (competicion IN ('laliga', 'segunda', 'ligaf')),
    equipo_local TEXT NOT NULL,
    equipo_visitante TEXT NOT NULL,
    api_fixture_id INTEGER,
    kickoff_at TIMESTAMP WITH TIME ZONE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'programado' CHECK (estado IN ('programado', 'en_juego', 'finalizado')),
    goles_local INTEGER,
    goles_visitante INTEGER,
    es_pleno_al_15 BOOLEAN NOT NULL DEFAULT false,
    pleno_al_15_local TEXT CHECK (pleno_al_15_local IN ('0', '1', '2', 'M')),
    pleno_al_15_visitante TEXT CHECK (pleno_al_15_visitante IN ('0', '1', '2', 'M')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migración idempotente por si la tabla ya existía sin estas columnas.
ALTER TABLE public.quiniela_partidos ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.quiniela_partidos ADD COLUMN IF NOT EXISTS es_pleno_al_15 BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.quiniela_partidos ADD COLUMN IF NOT EXISTS pleno_al_15_local TEXT CHECK (pleno_al_15_local IN ('0', '1', '2', 'M'));
ALTER TABLE public.quiniela_partidos ADD COLUMN IF NOT EXISTS pleno_al_15_visitante TEXT CHECK (pleno_al_15_visitante IN ('0', '1', '2', 'M'));

-- Columna (pronóstico 1X2) de un jugador para una jornada
CREATE TABLE IF NOT EXISTS public.quiniela_columnas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jornada_id UUID NOT NULL REFERENCES public.quiniela_jornadas(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.quiniela_players(id) ON DELETE CASCADE,
    picks JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (jornada_id, player_id)
);

-- RLS: lectura pública, escritura solo para el creador autenticado por Supabase Auth
-- (mismo usuario que ya usas en el resto del ecosistema, uid e997ceee-be4b-4498-ab75-1947e042d5e1).
ALTER TABLE public.quiniela_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiniela_jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiniela_partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiniela_columnas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública" ON public.quiniela_players FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON public.quiniela_jornadas FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON public.quiniela_partidos FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON public.quiniela_columnas FOR SELECT USING (true);

CREATE POLICY "Escritura solo creador" ON public.quiniela_players FOR ALL
  USING (auth.uid() = 'e997ceee-be4b-4498-ab75-1947e042d5e1') WITH CHECK (auth.uid() = 'e997ceee-be4b-4498-ab75-1947e042d5e1');
CREATE POLICY "Escritura solo creador" ON public.quiniela_jornadas FOR ALL
  USING (auth.uid() = 'e997ceee-be4b-4498-ab75-1947e042d5e1') WITH CHECK (auth.uid() = 'e997ceee-be4b-4498-ab75-1947e042d5e1');
CREATE POLICY "Escritura solo creador" ON public.quiniela_partidos FOR ALL
  USING (auth.uid() = 'e997ceee-be4b-4498-ab75-1947e042d5e1') WITH CHECK (auth.uid() = 'e997ceee-be4b-4498-ab75-1947e042d5e1');
CREATE POLICY "Escritura solo creador" ON public.quiniela_columnas FOR ALL
  USING (auth.uid() = 'e997ceee-be4b-4498-ab75-1947e042d5e1') WITH CHECK (auth.uid() = 'e997ceee-be4b-4498-ab75-1947e042d5e1');

-- La función serverless de sync en vivo (api/quiniela-live.ts) escribe con la
-- service_role key, que salta RLS por diseño de Supabase, así que no necesita
-- una policy propia aquí.
`;
  },
};
