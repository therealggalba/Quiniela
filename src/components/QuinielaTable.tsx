import { useEffect, useRef, useState } from 'react';
import { contarAciertos, resultadoPick, type Columna, type Partido, type Player } from '../domain/quiniela';
import { TeamBadge } from './TeamBadge';

interface Props {
  players: Player[];
  columnas: Columna[];
  partidos: Partido[];
  favoritePlayerId: string | null;
  onToggleFavorite: (playerId: string) => void;
  /** Posición de cada jugador en la clasificación general (no en esta jornada). */
  posiciones: Map<string, number>;
}

/**
 * Tabla estilo hoja de cálculo: la columna de partidos es fija (misma para
 * todos, no se mueve) y a su derecha se desliza, de una en una, la columna
 * de pronósticos de cada jugador (orden alfabético). Cada fila mide lo
 * mismo en ambos lados para que siempre queden alineadas, sin importar la
 * longitud del nombre del equipo. Pensada para caber en pantalla con el
 * mínimo scroll posible: partidos a una sola línea, hora omitida.
 */
export function QuinielaTable({ players, columnas, partidos, favoritePlayerId, onToggleFavorite, posiciones }: Props) {
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
  const posicion = posiciones.get(currentPlayer.id);

  return (
    <div className="qt">
      <div className="qt__header">
        <div className="qt__header-matches" aria-hidden="true" />
        <div className="qt__header-player">
          <div className="qt__player-name">
            <button
              type="button"
              className={`fav-btn ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(currentPlayer.id)}
              aria-label={isFavorite ? 'Quitar de favorita' : 'Marcar como favorita'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
            {currentPlayer.name}
          </div>
          <div className="qt__player-stats">
            <span className="qt-stat-pill qt-stat-pill--aciertos">{aciertos}/{resueltos} aciertos</span>
            {posicion && <span className="qt-stat-pill qt-stat-pill--posicion">{posicion}º gral.</span>}
          </div>
        </div>
      </div>

      <div className="qt__body">
        <div className="qt__matches">
          {partidos.map((partido) => (
            <div key={partido.id} className={`qt-match-cell qt-match-cell--${partido.competicion}${partido.esPlenoAl15 ? ' qt-match-cell--pleno' : ''}`}>
              <TeamBadge competicion={partido.competicion} team={partido.equipoLocal} />
              <span className="qt-match-cell__names">
                {partido.equipoLocal} – {partido.equipoVisitante}
              </span>
              <TeamBadge competicion={partido.competicion} team={partido.equipoVisitante} />
              <span className={`qt-match-cell__marcador ${partido.estado === 'en_juego' ? 'live' : ''}`}>
                {partido.estado === 'en_juego' && <span className="live-dot" />}
                {partido.esPlenoAl15 && '🎯 '}
                {partido.estado === 'programado' ? '–' : `${partido.golesLocal ?? '-'}-${partido.golesVisitante ?? '-'}`}
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
