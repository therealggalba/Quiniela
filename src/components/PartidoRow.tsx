import { COMPETICION_LABEL, resultadoPick, type Partido } from '../domain/quiniela';
import { TeamBadge } from './TeamBadge';

interface Props {
  partido: Partido;
  pick?: string;
}

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function PartidoRow({ partido, pick }: Props) {
  const acierto = resultadoPick(partido, pick);
  const badgeClass = acierto === true ? 'hit' : acierto === false ? 'miss' : '';
  const badgeText = partido.esPlenoAl15 ? pick || '–' : pick ?? '–';

  return (
    <div className="partido-row">
      <div className="partido-row__teams">
        <span className="partido-row__competicion">
          #{partido.orden} · {COMPETICION_LABEL[partido.competicion]}
          {partido.esPlenoAl15 && ' · Pleno al 15'}
        </span>
        <span className="partido-row__equipos">
          <TeamBadge competicion={partido.competicion} team={partido.equipoLocal} />
          {partido.equipoLocal} – {partido.equipoVisitante}
          <TeamBadge competicion={partido.competicion} team={partido.equipoVisitante} />
        </span>
        <span className="partido-row__kickoff">{formatKickoff(partido.kickoffAt)}</span>
      </div>

      <span className={`partido-row__marcador ${partido.estado === 'en_juego' ? 'live' : ''}`}>
        {partido.estado === 'en_juego' && <span className="live-dot" />}
        {partido.estado === 'programado' ? '– : –' : `${partido.golesLocal ?? '-'} - ${partido.golesVisitante ?? '-'}`}
      </span>

      <span className={`pick-badge ${badgeClass} ${partido.esPlenoAl15 ? 'pick-badge--score' : ''}`}>{badgeText}</span>
    </div>
  );
}
