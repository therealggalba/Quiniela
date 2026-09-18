import { useEffect, useRef, useState } from 'react';
import { contarAciertos, type Columna, type Partido, type Player } from '../domain/quiniela';
import { PartidoRow } from './PartidoRow';

interface Props {
  players: Player[];
  columnas: Columna[];
  partidos: Partido[];
  favoritePlayerId: string | null;
  onToggleFavorite: (playerId: string) => void;
}

export function ColumnaCarousel({ players, columnas, partidos, favoritePlayerId, onToggleFavorite }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const scrolledToFavorite = useRef(false);

  useEffect(() => {
    if (scrolledToFavorite.current || !favoritePlayerId) return;
    const el = cardRefs.current[favoritePlayerId];
    if (el) {
      el.scrollIntoView({ inline: 'center', block: 'nearest' });
      scrolledToFavorite.current = true;
    }
  }, [favoritePlayerId, players]);

  function handleScroll() {
    const container = containerRef.current;
    if (!container) return;
    const center = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let closestDist = Infinity;
    players.forEach((player, index) => {
      const el = cardRefs.current[player.id];
      if (!el) return;
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = index;
      }
    });
    setActiveIndex(closestIndex);
  }

  if (players.length === 0) {
    return <div className="empty-state">Todavía no hay jugadores en esta quiniela.</div>;
  }

  return (
    <div>
      <div className="carousel" ref={containerRef} onScroll={handleScroll}>
        {players.map((player) => {
          const columna = columnas.find((c) => c.playerId === player.id);
          const aciertos = columna ? contarAciertos(columna, partidos) : 0;
          const resueltos = partidos.filter((p) => p.estado === 'finalizado').length;
          const isFavorite = favoritePlayerId === player.id;

          return (
            <div
              key={player.id}
              className="columna-card"
              ref={(el) => {
                cardRefs.current[player.id] = el;
              }}
            >
              <div className="columna-card__header">
                <span className="columna-card__name">{player.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="columna-card__stats">
                    {aciertos}/{resueltos} aciertos
                  </span>
                  <button
                    type="button"
                    className={`fav-btn ${isFavorite ? 'active' : ''}`}
                    onClick={() => onToggleFavorite(player.id)}
                    aria-label={isFavorite ? 'Quitar de favorita' : 'Marcar como favorita'}
                  >
                    {isFavorite ? '★' : '☆'}
                  </button>
                </div>
              </div>
              {columna ? (
                partidos.map((partido) => (
                  <PartidoRow key={partido.id} partido={partido} pick={columna.picks[partido.id]} />
                ))
              ) : (
                <div className="empty-state">Sin columna todavía.</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="carousel-dots">
        {players.map((player, index) => (
          <span key={player.id} className={index === activeIndex ? 'active' : ''} />
        ))}
      </div>
    </div>
  );
}
