import { useEffect, useState } from 'react';
import { dbService } from '../../dbService';
import {
  COMPETICION_LABEL,
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

export function AdminDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [selectedJornadaId, setSelectedJornadaId] = useState<string | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [columnas, setColumnas] = useState<Columna[]>([]);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newJornadaNumero, setNewJornadaNumero] = useState('');

  const [newPartido, setNewPartido] = useState({
    competicion: 'laliga' as Competicion,
    equipoLocal: '',
    equipoVisitante: '',
    kickoffAt: '',
    apiFixtureId: '',
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [draftPicks, setDraftPicks] = useState<Record<string, Signo>>({});

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

  const selectedJornada = jornadas.find((j) => j.id === selectedJornadaId) ?? null;

  async function handleAddPlayer() {
    const name = newPlayerName.trim();
    if (!name) return;
    await dbService.createPlayer(name);
    setNewPlayerName('');
    await refreshPlayers();
  }

  async function handleAddJornada() {
    const numero = Number(newJornadaNumero);
    if (!numero) return;
    const jornada = await dbService.createJornada(numero);
    setNewJornadaNumero('');
    await refreshJornadas();
    setSelectedJornadaId(jornada.id);
  }

  async function handleSetEstado(estado: EstadoJornada) {
    if (!selectedJornadaId) return;
    await dbService.setJornadaEstado(selectedJornadaId, estado);
    await refreshJornadas();
  }

  async function handleAddPartido() {
    if (!selectedJornadaId) return;
    if (!newPartido.equipoLocal.trim() || !newPartido.equipoVisitante.trim() || !newPartido.kickoffAt) return;
    await dbService.createPartido({
      jornadaId: selectedJornadaId,
      competicion: newPartido.competicion,
      equipoLocal: newPartido.equipoLocal.trim(),
      equipoVisitante: newPartido.equipoVisitante.trim(),
      apiFixtureId: newPartido.apiFixtureId ? Number(newPartido.apiFixtureId) : null,
      kickoffAt: new Date(newPartido.kickoffAt).toISOString(),
      estado: 'programado',
      golesLocal: null,
      golesVisitante: null,
    });
    setNewPartido({ competicion: 'laliga', equipoLocal: '', equipoVisitante: '', kickoffAt: '', apiFixtureId: '' });
    await refreshJornadaData(selectedJornadaId);
  }

  async function handleDeletePartido(id: string) {
    if (!selectedJornadaId) return;
    await dbService.deletePartido(id);
    await refreshJornadaData(selectedJornadaId);
  }

  async function handleResultado(partido: Partido, golesLocal: string, golesVisitante: string) {
    if (!selectedJornadaId) return;
    const gl = golesLocal === '' ? null : Number(golesLocal);
    const gv = golesVisitante === '' ? null : Number(golesVisitante);
    const estado: EstadoPartido = gl !== null && gv !== null ? 'finalizado' : partido.estado;
    await dbService.updatePartido(partido.id, { golesLocal: gl, golesVisitante: gv, estado });
    await refreshJornadaData(selectedJornadaId);
  }

  async function handleEstadoPartido(partido: Partido, estado: EstadoPartido) {
    if (!selectedJornadaId) return;
    await dbService.updatePartido(partido.id, { estado });
    await refreshJornadaData(selectedJornadaId);
  }

  function setPick(partidoId: string, signo: Signo) {
    setDraftPicks((prev) => ({ ...prev, [partidoId]: signo }));
  }

  async function handleSaveColumna() {
    if (!selectedJornadaId || !selectedPlayerId) return;
    await dbService.upsertColumna(selectedJornadaId, selectedPlayerId, draftPicks);
    await refreshJornadaData(selectedJornadaId);
  }

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1 style={{ fontSize: '1.1rem', margin: 0 }}>Modo edición</h1>
        <button type="button" className="btn" onClick={() => supabase?.auth.signOut()}>
          Cerrar sesión
        </button>
      </div>

      <section className="admin-section">
        <h2>Jugadores</h2>
        <div className="form-row">
          <input
            placeholder="Nombre del jugador"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={handleAddPlayer}>
            Añadir
          </button>
        </div>
        {players.map((p) => (
          <div key={p.id} className="list-item">
            <span>{p.name}</span>
          </div>
        ))}
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
              Jornada {j.numero} ({j.estado})
            </option>
          ))}
        </select>
        {selectedJornada && (
          <div className="form-row" style={{ marginTop: '0.5rem' }}>
            {(['abierta', 'en_juego', 'cerrada'] as EstadoJornada[]).map((estado) => (
              <button
                key={estado}
                type="button"
                className="btn"
                disabled={selectedJornada.estado === estado}
                onClick={() => handleSetEstado(estado)}
              >
                Marcar {estado.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedJornada && (
        <>
          <section className="admin-section">
            <h2>Partidos — Jornada {selectedJornada.numero}</h2>
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
              <input
                placeholder="Equipo local"
                value={newPartido.equipoLocal}
                onChange={(e) => setNewPartido({ ...newPartido, equipoLocal: e.target.value })}
              />
              <input
                placeholder="Equipo visitante"
                value={newPartido.equipoVisitante}
                onChange={(e) => setNewPartido({ ...newPartido, equipoVisitante: e.target.value })}
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
              <button type="button" className="btn btn-primary" onClick={handleAddPartido}>
                Añadir partido
              </button>
            </div>

            {partidos.map((partido) => (
              <div key={partido.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {COMPETICION_LABEL[partido.competicion]}: {partido.equipoLocal} – {partido.equipoVisitante}
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

            {selectedPlayerId &&
              partidos.map((partido) => (
                <div key={partido.id} style={{ margin: '0.6rem 0' }}>
                  <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    {partido.equipoLocal} – {partido.equipoVisitante}
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
