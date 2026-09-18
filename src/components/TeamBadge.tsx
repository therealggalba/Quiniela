import { useState } from 'react';
import type { Competicion } from '../domain/quiniela';
import { findTeam } from '../domain/teams';

interface Props {
  competicion: Competicion;
  team: string;
}

export function TeamBadge({ competicion, team }: Props) {
  const [failed, setFailed] = useState(false);
  const info = findTeam(competicion, team);
  const crestUrl = info?.crestUrl;

  if (crestUrl && !failed) {
    return <img src={crestUrl} alt="" className="team-badge" onError={() => setFailed(true)} />;
  }

  const code = info?.shortCode ?? team.slice(0, 3).toUpperCase();
  return (
    <span className="team-badge team-badge-fallback" aria-hidden="true">
      {code}
    </span>
  );
}
