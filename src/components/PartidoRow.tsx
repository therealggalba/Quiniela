import { COMPETICION_LABEL, resultadoPick, type Partido, type Signo } from '../domain/quiniela';

interface Props {
  partido: Partido;
  pick?: Signo;
}

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export function PartidoRow({ partido, pick }: Props) {
  const acierto = resultadoPick(partido, pick);
  const badgeClass = acierto === true ? 'hit' : acierto === false ? 'miss' : '';

  return (
    <div className="partido-row">
      <div className="partido-row__teams">
        <span className="partido-row__competicion">{COMPETICION_LABEL[partido.competicion]}</span>
        <span className="partido-row__equipos">
          {partido.equipoLocal} – {partido.equipoVisitante}
        </span>
      </div>

      {partido.estado === 'programado' ? (
        <span className="partido-row__marcador">{formatKickoff(partido.kickoffAt)}</span>
      ) : (
        <span className={`partido-row__marcador ${partido.estado === 'en_juego' ? 'live' : ''}`}>
          {partido.estado === 'en_juego' && <span className="live-dot" />}
          {partido.golesLocal ?? '-'} - {partido.golesVisitante ?? '-'}
        </span>
      )}

      <span className={`pick-badge ${badgeClass}`}>{pick ?? '–'}</span>
    </div>
  );
}
