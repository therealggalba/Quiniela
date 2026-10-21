import { useEffect, useRef, useState } from 'react';
import { contarAciertos, resultadoPick, type Columna, type Partido, type Player } from '../domain/quiniela';
import { shortTeamName } from '../domain/teams';
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
 * mismo en ambos lados para que siempre queden alineadas.
 *
 * Cada "página" del carrusel ocupa TODO el ancho de la tabla: arriba la
 * cabecera del jugador (nombre, aciertos, posición) a lo ancho, debajo sus
 * pronósticos alineados a la derecha. La columna de partidos es una capa
 * encima (sin eventos de puntero, el swipe pasa a través) que tapa la parte
 * izquierda de la página. Como la cabecera es parte de la página, se
 * desplaza con ella y nunca puede mostrar el nombre de otro jugador.
 *
 * Los partidos de Pleno al 15 (puede haber varios: mismo enfrentamiento
 * real duplicado, un resultado 0/1/2/M independiente cada uno) se funden
 * aquí en una única fila con todos sus resultados juntos, para no repetir
 * el mismo partido varias veces en pantalla.
 */
/** Una fila de la parte fija: escudo y nombre local · goles - goles · nombre y escudo visitante. */
function MatchRow({ partido, pleno = false }: { partido: Partido; pleno?: boolean }) {
  const jugado = partido.estado !== 'programado';
  const enJuego = partido.estado === 'en_juego';
  const nombre = `${partido.equipoLocal} – ${partido.equipoVisitante}`;
  return (
    <div
      className={`qt-match-cell qt-match-cell--${pleno ? 'pleno' : partido.competicion}`}
      title={nombre}
      aria-label={nombre}
    >
      <span className="qt-team qt-team--local">
        <TeamBadge competicion={partido.competicion} team={partido.equipoLocal} />
        <span className="qt-team__name">{shortTeamName(partido.equipoLocal)}</span>
      </span>
      <span className={`qt-score ${enJuego ? 'live' : ''} ${jugado ? '' : 'qt-score--pending'}`}>
        {jugado ? (
          <>
            <span className="qt-score__g qt-score__g--local">{partido.golesLocal ?? '-'}</span>
            <span className="qt-score__sep">-</span>
            <span className="qt-score__g qt-score__g--visitante">{partido.golesVisitante ?? '-'}</span>
          </>
        ) : (
          'vs'
        )}
        {enJuego && <span className="live-dot" />}
      </span>
      <span className="qt-team qt-team--visitante">
        <span className="qt-team__name">{shortTeamName(partido.equipoVisitante)}</span>
        <TeamBadge competicion={partido.competicion} team={partido.equipoVisitante} />
      </span>
    </div>
  );
}

export function QuinielaTable({ players, columnas, partidos, favoritePlayerId, onToggleFavorite, posiciones }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrolledToFavorite = useRef(false);

  useEffect(() => {
    if (scrolledToFavorite.current || !favoritePlayerId) return;
    const index = players.findIndex((p) => p.id === favoritePlayerId);
    if (index < 0) return;
    const container = scrollRef.current;
    const firstPage = container?.firstElementChild as HTMLElement | null;
    if (container && firstPage) {
      container.scrollLeft = index * firstPage.getBoundingClientRect().width;
      setActiveIndex(index);
      scrolledToFavorite.current = true;
    }
  }, [favoritePlayerId, players]);

  // Solo alimenta los puntitos indicadores; la cabecera ya no depende de esto.
  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const c = container.getBoundingClientRect();
    const centro = c.left + c.width / 2;
    let mejor = 0;
    let mejorDist = Infinity;
    Array.from(container.children).forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - centro);
      if (dist < mejorDist) {
        mejorDist = dist;
        mejor = i;
      }
    });
    setActiveIndex(mejor);
  }

  if (players.length === 0) {
    return <div className="empty-state">Todavía no hay jugadores en esta quiniela.</div>;
  }
  if (partidos.length === 0) {
    return <div className="empty-state">Todavía no hay partidos en esta jornada.</div>;
  }

  const partidosNormales = partidos.filter((p) => !p.esPlenoAl15);
  const partidosPlenos = partidos.filter((p) => p.esPlenoAl15);
  const plenoRef = partidosPlenos[0];
  const resueltos = partidosNormales.filter((p) => p.estado === 'finalizado').length;

  return (
    <div className="qt">
      <div className="qt__body">
        <div className="qt__picks" ref={scrollRef} onScroll={handleScroll}>
          {players.map((player) => {
            const columna = columnas.find((c) => c.playerId === player.id);
            const aciertos = columna ? contarAciertos(columna, partidos) : 0;
            const posicion = posiciones.get(player.id);
            const isFavorite = favoritePlayerId === player.id;
            return (
              <div key={player.id} className="qt-picks-page">
                <div className="qt-pick-head">
                  <div className="qt__player-name">
                    <button
                      type="button"
                      className={`fav-btn ${isFavorite ? 'active' : ''}`}
                      onClick={() => onToggleFavorite(player.id)}
                      aria-label={isFavorite ? 'Quitar de favorita' : 'Marcar como favorita'}
                    >
                      {isFavorite ? '★' : '☆'}
                    </button>
                    {player.name}
                  </div>
                  <div className="qt__player-stats">
                    <span className="qt-stat-pill qt-stat-pill--aciertos">
                      {aciertos}/{resueltos} aciertos
                    </span>
                    {posicion && <span className="qt-stat-pill qt-stat-pill--posicion">{posicion}º</span>}
                  </div>
                </div>
                <div className="qt-picks-rows">
                  {partidosNormales.map((partido) => {
                    const pick = columna?.picks[partido.id];
                    const acierto = resultadoPick(partido, pick);
                    const badgeClass = acierto === true ? 'hit' : acierto === false ? 'miss' : '';
                    return (
                      <div key={partido.id} className="qt-pick-cell">
                        <span className={`pick-badge ${badgeClass}`}>{pick ?? '–'}</span>
                      </div>
                    );
                  })}
                  {plenoRef && (
                    <div className="qt-pick-cell">
                      {/* La porra del Pleno al 15 es la misma para todos (no es un pronóstico
                          individual), pero se muestra aquí, en la columna de cada jugador —
                          no en la parte fija de partidos, que es solo para el resultado real. */}
                      <span className="pick-badge pick-badge--score">
                        {partidosPlenos.map((p) => `${p.plenoAl15Local ?? '?'}-${p.plenoAl15Visitante ?? '?'}`).join(' · ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="qt__matches">
          {partidosNormales.map((partido) => (
            <MatchRow key={partido.id} partido={partido} />
          ))}
          {/* Resultado REAL del partido (igual que cualquier otro), no la porra — esa va en la columna de cada jugador. */}
          {plenoRef && <MatchRow partido={plenoRef} pleno />}
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
