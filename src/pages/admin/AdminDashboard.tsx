import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamSelect } from '../../components/TeamSelect';
import { dbService } from '../../dbService';
import {
  COMPETICION_LABEL,
  COMPETICION_SLOT_RANGE,
  PRESET_PLAYERS,
  type Columna,
  type Competicion,
  type EstadoJornada,
  type EstadoPartido,
  type Jornada,
  type Partido,
  type Player,
  type Signo,
} from '../../domain/quiniela';
import { supabase } from '../../lib/supabaseClient';

const COMPETICIONES: Competicion[] = ['laliga', 'segunda', 'ligaf'];
const SIGNOS: Signo[] = ['1', 'X', '2'];
const ESTADO_JORNADA_LABEL: Record<EstadoJornada, string> = {
  abierta: 'Abierta',
  en_juego: 'En juego',
  cerrada: 'Cerrada',
};

function suggestCompeticion(orden: number): Competicion {
  for (const c of COMPETICIONES) {
    const [min, max] = COMPETICION_SLOT_RANGE[c];
    if (orden >= min && orden <= max) return c;
  }
  return 'ligaf';
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [selectedJornadaId, setSelectedJornadaId] = useState<string | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [columnas, setColumnas] = useState<Columna[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newJornadaNumero, setNewJornadaNumero] = useState('');

  const [newPartido, setNewPartido] = useState({
    competicion: 'laliga' as Competicion,
    equipoLocal: '',
    equipoVisitante: '',
    kickoffAt: '',
    apiFixtureId: '',
    esPlenoAl15: false,
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [draftPicks, setDraftPicks] = useState<Record<string, string>>({});

  async function runAction(action: () => Promise<void>, successMessage?: string) {
    setFeedback(null);
    try {
      await action();
      if (successMessage) setFeedback({ type: 'success', message: successMessage });
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: e instanceof Error ? e.message : 'Error desconocido' });
    }
  }

  async function refreshPlayers() {
    setPlayers(await dbService.listPlayers());
  }

  async function refreshJornadas() {
    const data = await dbService.listJornadas();
    setJornadas(data);
    return data;
  }

  async function refreshJornadaData(jornadaId: string) {
    const [partidosData, columnasData] = await Promise.all([
      dbService.listPartidos(jornadaId),
      dbService.listColumnas(jornadaId),
    ]);
    setPartidos(partidosData);
    setColumnas(columnasData);
  }

  useEffect(() => {
    async function init() {
      await refreshPlayers();
      const data = await refreshJornadas();
      if (data.length > 0) setSelectedJornadaId(data[0].id);
    }
    init();
  }, []);

  useEffect(() => {
    if (selectedJornadaId) refreshJornadaData(selectedJornadaId);
    else {
      setPartidos([]);
      setColumnas([]);
    }
    setSelectedPlayerId(null);
  }, [selectedJornadaId]);

  useEffect(() => {
    if (!selectedPlayerId) {
      setDraftPicks({});
      return;
    }
    const existing = columnas.find((c) => c.playerId === selectedPlayerId);
    setDraftPicks(existing ? { ...existing.picks } : {});
  }, [selectedPlayerId, columnas]);

  // Sugiere la siguiente competición según el hueco de la quiniela oficial
  // (1-7 Primera, 8-10 Segunda, 11-14 Liga F) cada vez que se añade un partido.
  useEffect(() => {
    setNewPartido((prev) => ({ ...prev, competicion: suggestCompeticion(partidos.length + 1), equipoLocal: '', equipoVisitante: '' }));
  }, [partidos.length]);

  const selectedJornada = jornadas.find((j) => j.id === selectedJornadaId) ?? null;

  async function handleAddPlayer() {
    const name = newPlayerName.trim();
    if (!name) return;
    await runAction(async () => {
      await dbService.createPlayer(name);
      setNewPlayerName('');
      await refreshPlayers();
    });
  }

  async function handleLoadTemplate() {
    await runAction(async () => {
      const existingNames = new Set(players.map((p) => p.name));
      for (const name of PRESET_PLAYERS) {
        if (!existingNames.has(name)) await dbService.createPlayer(name);
      }
      await refreshPlayers();
    }, 'Plantilla cargada');
  }

  async function handleAddJornada() {
    const numero = Number(newJornadaNumero);
    if (!numero) return;
    await runAction(async () => {
      const jornada = await dbService.createJornada(numero);
      setNewJornadaNumero('');
      await refreshJornadas();
      setSelectedJornadaId(jornada.id);
    }, `Jornada ${numero} creada (abierta)`);
  }

  async function handleSetEstado(estado: EstadoJornada) {
    if (!selectedJornadaId) return;
    await runAction(async () => {
      await dbService.setJornadaEstado(selectedJornadaId, estado);
      await refreshJornadas();
    }, `Jornada marcada como ${ESTADO_JORNADA_LABEL[estado].toLowerCase()}`);
  }

  async function handleAddPartido() {
    if (!selectedJornadaId) return;
    if (!newPartido.equipoLocal.trim() || !newPartido.equipoVisitante.trim() || !newPartido.kickoffAt) {
      setFeedback({ type: 'error', message: 'Rellena equipos y hora antes de añadir el partido.' });
      return;
    }
    await runAction(async () => {
      await dbService.createPartido({
        jornadaId: selectedJornadaId,
        orden: partidos.length + 1,
        competicion: newPartido.competicion,
        equipoLocal: newPartido.equipoLocal.trim(),
        equipoVisitante: newPartido.equipoVisitante.trim(),
        apiFixtureId: newPartido.apiFixtureId ? Number(newPartido.apiFixtureId) : null,
        kickoffAt: new Date(newPartido.kickoffAt).toISOString(),
        estado: 'programado',
        golesLocal: null,
        golesVisitante: null,
        esPlenoAl15: newPartido.esPlenoAl15,
      });
      setNewPartido((prev) => ({ ...prev, equipoLocal: '', equipoVisitante: '', kickoffAt: '', apiFixtureId: '', esPlenoAl15: false }));
      await refreshJornadaData(selectedJornadaId);
    }, 'Partido añadido');
  }

  async function handleDeletePartido(id: string) {
    if (!selectedJornadaId) return;
    await runAction(async () => {
      await dbService.deletePartido(id);
      await refreshJornadaData(selectedJornadaId);
    }, 'Partido eliminado');
  }

  async function handleResultado(partido: Partido, golesLocal: string, golesVisitante: string) {
    if (!selectedJornadaId) return;
    const gl = golesLocal === '' ? null : Number(golesLocal);
    const gv = golesVisitante === '' ? null : Number(golesVisitante);
    const estado: EstadoPartido = gl !== null && gv !== null ? 'finalizado' : partido.estado;
    await runAction(async () => {
      await dbService.updatePartido(partido.id, { golesLocal: gl, golesVisitante: gv, estado });
      await refreshJornadaData(selectedJornadaId);
    });
  }

  async function handleEstadoPartido(partido: Partido, estado: EstadoPartido) {
    if (!selectedJornadaId) return;
    await runAction(async () => {
      await dbService.updatePartido(partido.id, { estado });
      await refreshJornadaData(selectedJornadaId);
    });
  }

  function setPick(partidoId: string, signo: Signo) {
    setDraftPicks((prev) => ({ ...prev, [partidoId]: signo }));
  }

  async function handleSaveColumna() {
    if (!selectedJornadaId || !selectedPlayerId) return;
    await runAction(async () => {
      await dbService.upsertColumna(selectedJornadaId, selectedPlayerId, draftPicks);
      await refreshJornadaData(selectedJornadaId);
    }, 'Columna guardada');
  }

  async function handleVolver() {
    await supabase?.auth.signOut();
    navigate('/');
  }

  const conteoPorCompeticion = COMPETICIONES.map((c) => ({
    competicion: c,
    count: partidos.filter((p) => p.competicion === c).length,
    range: COMPETICION_SLOT_RANGE[c],
  }));

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <button type="button" className="btn" onClick={handleVolver}>
          ← Volver al inicio
        </button>
        <h1 style={{ fontSize: '1.1rem', margin: 0 }}>Modo edición</h1>
      </div>

      {feedback && <div className={feedback.type === 'error' ? 'field-error' : 'field-success'}>{feedback.message}</div>}

      <section className="admin-section">
        <h2>Jugadores ({players.length})</h2>
        <div className="form-row">
          <input
            placeholder="Nombre / iniciales"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={handleAddPlayer}>
            Añadir
          </button>
        </div>
        <details className="players-details">
          <summary>Ver / gestionar jugadores</summary>
          <button type="button" className="btn" style={{ margin: '0.5rem 0' }} onClick={handleLoadTemplate}>
            Cargar plantilla habitual
          </button>
          <div className="players-grid">
            {players.map((p) => (
              <span key={p.id} className="player-chip">
                {p.name}
              </span>
            ))}
          </div>
        </details>
      </section>

      <section className="admin-section">
        <h2>Jornadas</h2>
        <div className="form-row">
          <input
            type="number"
            placeholder="Número de jornada"
            value={newJornadaNumero}
            onChange={(e) => setNewJornadaNumero(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={handleAddJornada}>
            Crear jornada
          </button>
        </div>
        <select value={selectedJornadaId ?? ''} onChange={(e) => setSelectedJornadaId(e.target.value || null)}>
          <option value="">— Selecciona una jornada —</option>
          {jornadas.map((j) => (
            <option key={j.id} value={j.id}>
              Jornada {j.numero} ({ESTADO_JORNADA_LABEL[j.estado]})
            </option>
          ))}
        </select>
        {selectedJornada && (
          <div className="segmented" style={{ marginTop: '0.5rem' }}>
            {(['abierta', 'en_juego', 'cerrada'] as EstadoJornada[]).map((estado) => (
              <button
                key={estado}
                type="button"
                className={selectedJornada.estado === estado ? 'active' : ''}
                disabled={selectedJornada.estado === estado}
                onClick={() => handleSetEstado(estado)}
              >
                {ESTADO_JORNADA_LABEL[estado]}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedJornada && (
        <>
          <section className="admin-section">
            <h2>Partidos — Jornada {selectedJornada.numero}</h2>
            <p className="slot-progress">
              {conteoPorCompeticion.map(({ competicion, count, range }) => (
                <span key={competicion}>
                  {COMPETICION_LABEL[competicion]} {count}/{range[1] - range[0] + 1}
                </span>
              ))}
            </p>
            <div className="form-row">
              <select
                value={newPartido.competicion}
                onChange={(e) => setNewPartido({ ...newPartido, competicion: e.target.value as Competicion })}
              >
                {COMPETICIONES.map((c) => (
                  <option key={c} value={c}>
                    {COMPETICION_LABEL[c]}
                  </option>
                ))}
              </select>
              <TeamSelect
                competicion={newPartido.competicion}
                value={newPartido.equipoLocal}
                onChange={(v) => setNewPartido({ ...newPartido, equipoLocal: v })}
                placeholder="Equipo local"
              />
              <TeamSelect
                competicion={newPartido.competicion}
                value={newPartido.equipoVisitante}
                onChange={(v) => setNewPartido({ ...newPartido, equipoVisitante: v })}
                placeholder="Equipo visitante"
              />
            </div>
            <div className="form-row">
              <input
                type="datetime-local"
                value={newPartido.kickoffAt}
                onChange={(e) => setNewPartido({ ...newPartido, kickoffAt: e.target.value })}
              />
              <input
                placeholder="ID fixture API-Football (opcional)"
                value={newPartido.apiFixtureId}
                onChange={(e) => setNewPartido({ ...newPartido, apiFixtureId: e.target.value })}
              />
            </div>
            <div className="form-row" style={{ alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={newPartido.esPlenoAl15}
                  onChange={(e) => setNewPartido({ ...newPartido, esPlenoAl15: e.target.checked })}
                />
                Pleno al 15 (marcador exacto)
              </label>
              <button type="button" className="btn btn-primary" onClick={handleAddPartido}>
                Añadir partido #{partidos.length + 1}
              </button>
            </div>

            {partidos.map((partido) => (
              <div key={partido.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    #{partido.orden} {COMPETICION_LABEL[partido.competicion]}: {partido.equipoLocal} – {partido.equipoVisitante}
                    {partido.esPlenoAl15 && ' · Pleno al 15'}
                  </span>
                  <button type="button" className="btn btn-danger" onClick={() => handleDeletePartido(partido.id)}>
                    Eliminar
                  </button>
                </div>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Goles local"
                    defaultValue={partido.golesLocal ?? ''}
                    onBlur={(e) => handleResultado(partido, e.target.value, String(partido.golesVisitante ?? ''))}
                  />
                  <input
                    type="number"
                    placeholder="Goles visitante"
                    defaultValue={partido.golesVisitante ?? ''}
                    onBlur={(e) => handleResultado(partido, String(partido.golesLocal ?? ''), e.target.value)}
                  />
                  <select value={partido.estado} onChange={(e) => handleEstadoPartido(partido, e.target.value as EstadoPartido)}>
                    <option value="programado">Programado</option>
                    <option value="en_juego">En juego</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
              </div>
            ))}
          </section>

          <section className="admin-section">
            <h2>Columnas — Jornada {selectedJornada.numero}</h2>
            <select value={selectedPlayerId ?? ''} onChange={(e) => setSelectedPlayerId(e.target.value || null)}>
              <option value="">— Selecciona un jugador —</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {selectedPlayerId && partidos.length === 0 && (
              <p className="empty-state">Añade partidos a esta jornada antes de crear columnas.</p>
            )}

            {selectedPlayerId && partidos.some((p) => p.esPlenoAl15) && (
              <p className="empty-state" style={{ padding: '0.5rem 0' }}>
                Los partidos de Pleno al 15 son el mismo resultado para todos — se rellenan una vez en
                "Partidos" (goles local/visitante), no aquí.
              </p>
            )}

            {selectedPlayerId &&
              partidos
                .filter((p) => !p.esPlenoAl15)
                .map((partido) => (
                  <div key={partido.id} style={{ margin: '0.6rem 0' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      #{partido.orden} {partido.equipoLocal} – {partido.equipoVisitante}
                    </div>
                    <div className="pick-selector">
                      {SIGNOS.map((signo) => (
                        <button
                          key={signo}
                          type="button"
                          className={draftPicks[partido.id] === signo ? 'selected' : ''}
                          onClick={() => setPick(partido.id, signo)}
                        >
                          {signo}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

            {selectedPlayerId && partidos.length > 0 && (
              <button type="button" className="btn btn-primary" onClick={handleSaveColumna}>
                Guardar columna
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}
