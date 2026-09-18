import type { Competicion } from './quiniela';

export interface TeamInfo {
  name: string;
  shortCode: string;
  crestUrl?: string;
}

// Escudos oficiales servidos por TheSportsDB (thesportsdb.com), reutilizando el
// mismo catálogo ya verificado en el proyecto laliga2627 (20 clubes de
// LaLiga 2026/27: los 17 que continúan de 2025/26 más los 3 ascendidos).
const LALIGA_TEAMS: TeamInfo[] = [
  { name: 'Real Madrid', shortCode: 'RMA', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png' },
  { name: 'FC Barcelona', shortCode: 'FCB', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/wq9sir1639406443.png' },
  { name: 'Atlético de Madrid', shortCode: 'ATM', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/0ulh3q1719984315.png' },
  { name: 'Athletic Club', shortCode: 'ATH', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/68w7fe1639408210.png' },
  { name: 'Villarreal CF', shortCode: 'VIL', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/vrypqy1473503073.png' },
  { name: 'Real Betis', shortCode: 'BET', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/2oqulv1663245386.png' },
  { name: 'Real Sociedad', shortCode: 'RSO', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/vptvpr1473502986.png' },
  { name: 'RC Celta', shortCode: 'CEL', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/xfjtku1690436219.png' },
  { name: 'Rayo Vallecano', shortCode: 'RAY', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/nzhu941655595465.png' },
  { name: 'CA Osasuna', shortCode: 'OSA', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/rvspvt1473502960.png' },
  { name: 'Getafe CF', shortCode: 'GET', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/eyh2891655594452.png' },
  { name: 'Sevilla FC', shortCode: 'SEV', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/vpsqqx1473502977.png' },
  { name: 'Valencia CF', shortCode: 'VAL', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/dm8l6o1655594864.png' },
  { name: 'Deportivo Alavés', shortCode: 'ALA', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/mfn99h1734673842.png' },
  { name: 'RCD Espanyol', shortCode: 'ESP', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/867nzz1681703222.png' },
  { name: 'Levante UD', shortCode: 'LEV', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/xwtxsx1473503739.png' },
  { name: 'Elche CF', shortCode: 'ELC', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/e4vaw51655594332.png' },
  { name: 'Racing de Santander', shortCode: 'RAC', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/97kkiq1536575158.png' },
  { name: 'Deportivo de La Coruña', shortCode: 'DEP', crestUrl: 'https://www.thesportsdb.com/images/media/team/badge/js3j841783013173.png' },
  { name: 'Málaga CF', shortCode: 'MAL', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/upqyvr1473502952.png' },
];

// TODO: pendiente de completar con la investigación de escudos en curso.
const SEGUNDA_TEAMS: TeamInfo[] = [];

// TODO: pendiente de completar con la investigación de escudos en curso.
const LIGAF_TEAMS: TeamInfo[] = [];

export const TEAMS_BY_COMPETICION: Record<Competicion, TeamInfo[]> = {
  laliga: LALIGA_TEAMS,
  segunda: SEGUNDA_TEAMS,
  ligaf: LIGAF_TEAMS,
};

export function findTeam(competicion: Competicion, name: string): TeamInfo | undefined {
  return TEAMS_BY_COMPETICION[competicion].find((t) => t.name === name);
}
