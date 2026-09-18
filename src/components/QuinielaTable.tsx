import { useEffect, useRef, useState } from 'react';
import { COMPETICION_LABEL, contarAciertos, resultadoPick, type Columna, type Partido, type Player } from '../domain/quiniela';
import { TeamBadge } from './TeamBadge';

interface Props {
  players: Player[];
  columnas: Columna[];
  partidos: Partido[];
  favoritePlayerId: string | null;
  onToggleFavorite: (playerId: string) => void;
}

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/**
 * Tabla estilo hoja de cálculo: la columna de partidos es fija (misma para
 * todos, no se mueve) y a su derecha se desliza, de una en una, la columna
 * de pronósticos de cada jugador (orden alfabético). Cada fila mide lo
 * mismo en ambos lados para que siempre queden alineadas, sin importar la
 * longitud del nombre del equipo.
 */
export function QuinielaTable({ players, columnas, partidos, favoritePlayerId, onToggleFavorite }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrolledToFavorite = useRef(false);

  useEffect(() => {
    if (scrolledToFavorite.current || !favoritePlayerId) return;
    const index = players.findIndex((p) => p.id === favoritePlayerId);
    if (index < 0) return;
    const container = scrollRef.current;
    if (container) {
      container.scrollLeft = index * container.clientWidth;
      setActiveIndex(index);
      scrolledToFavorite.current = true;
    }
  }, [favoritePlayerId, players]);

  function handleScroll() {
    const container = scrollRef.current;
    if (!container || container.clientWidth === 0) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveIndex(Math.max(0, Math.min(players.length - 1, index)));
  }

  if (players.length === 0) {
    return <div className="empty-state">Todavía no hay jugadores en esta quiniela.</div>;
  }
  if (partidos.length === 0) {
    return <div className="empty-state">Todavía no hay partidos en esta jornada.</div>;
  }

  const currentPlayer = players[activeIndex];
  const currentColumna = columnas.find((c) => c.playerId === currentPlayer.id);
  const aciertos = currentColumna ? contarAciertos(currentColumna, partidos) : 0;
  const resueltos = partidos.filter((p) => p.estado === 'finalizado' && !p.esPlenoAl15).length;
  const isFavorite = favoritePlayerId === currentPlayer.id;

  return (
    <div className="qt">
      <div className="qt__header">
        <div className="qt__player">
          <span className="qt__player-name">{currentPlayer.name}</span>
          <span className="qt__player-stats">
            {aciertos}/{resueltos} aciertos
          </span>
        </div>
        <button
          type="button"
          className={`fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(currentPlayer.id)}
          aria-label={isFavorite ? 'Quitar de favorita' : 'Marcar como favorita'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className="qt__body">
        <div className="qt__matches">
          {partidos.map((partido) => (
            <div key={partido.id} className="qt-match-cell">
              <span className="qt-match-cell__meta">
                #{partido.orden} · {COMPETICION_LABEL[partido.competicion]}
                {partido.esPlenoAl15 && ' · Pleno al 15'}
              </span>
              <span className="qt-match-cell__teams">
                <TeamBadge competicion={partido.competicion} team={partido.equipoLocal} />
                <span className="qt-match-cell__names">
                  {partido.equipoLocal} – {partido.equipoVisitante}
                </span>
                <TeamBadge competicion={partido.competicion} team={partido.equipoVisitante} />
              </span>
              <span className="qt-match-cell__foot">
                <span className="qt-match-cell__kickoff">{formatKickoff(partido.kickoffAt)}</span>
                <span className={`qt-match-cell__marcador ${partido.estado === 'en_juego' ? 'live' : ''}`}>
                  {partido.estado === 'en_juego' && <span className="live-dot" />}
                  {partido.estado === 'programado' ? '–:–' : `${partido.golesLocal ?? '-'}-${partido.golesVisitante ?? '-'}`}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="qt__picks" ref={scrollRef} onScroll={handleScroll}>
          {players.map((player) => {
            const columna = columnas.find((c) => c.playerId === player.id);
            return (
              <div key={player.id} className="qt-picks-page">
                {partidos.map((partido) => {
                  if (partido.esPlenoAl15) {
                    return (
                      <div key={partido.id} className="qt-pick-cell">
                        <span className="pick-badge pick-badge--muted">—</span>
                      </div>
                    );
                  }
                  const pick = columna?.picks[partido.id];
                  const acierto = resultadoPick(partido, pick);
                  const badgeClass = acierto === true ? 'hit' : acierto === false ? 'miss' : '';
                  return (
                    <div key={partido.id} className="qt-pick-cell">
                      <span className={`pick-badge ${badgeClass}`}>{pick ?? '–'}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="carousel-dots">
        {players.map((player, index) => (
          <span key={player.id} className={index === activeIndex ? 'active' : ''} />
        ))}
      </div>
    </div>
  );
}
