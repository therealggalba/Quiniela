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

// Segunda División 2026/27 (Hypermotion), 22 clubes — nombres confirmados vía
// Wikipedia y cruzados con TheSportsDB. RC Celta Fortuna es el filial del
// Celta jugando a la Segunda con licencia propia (equipo distinto del
// primer equipo, que sigue en LaLiga).
const SEGUNDA_TEAMS: TeamInfo[] = [
  { name: 'Albacete Balompié', shortCode: 'ALB', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/17oqja1616436316.png' },
  { name: 'UD Almería', shortCode: 'ALM', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/yswsww1473503818.png' },
  { name: 'FC Andorra', shortCode: 'AND', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/eyaka21639481902.png' },
  { name: 'Burgos CF', shortCode: 'BUR', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/79h3ul1708150894.png' },
  { name: 'Cádiz CF', shortCode: 'CAD', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/e2phzp1639408503.png' },
  { name: 'CD Castellón', shortCode: 'CAS', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/ywibjw1733456820.png' },
  { name: 'RC Celta Fortuna', shortCode: 'CFO', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/t22qex1690436192.png' },
  { name: 'AD Ceuta FC', shortCode: 'CEU', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/ja7sl51677475273.png' },
  { name: 'Córdoba CF', shortCode: 'COR', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/ttyyvy1473503827.png' },
  { name: 'SD Eibar', shortCode: 'EIB', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/hccive1680933599.png' },
  { name: 'CD Eldense', shortCode: 'ELD', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/asdjgc1733549950.png' },
  { name: 'Girona FC', shortCode: 'GIR', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/kfu7zu1659897499.png' },
  { name: 'Granada CF', shortCode: 'GRA', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/f9iss11677472689.png' },
  { name: 'UD Las Palmas', shortCode: 'LPA', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/mmhyb11616443601.png' },
  { name: 'CD Leganés', shortCode: 'LEG', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/tm0adr1616443898.png' },
  { name: 'RCD Mallorca', shortCode: 'MLL', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/ssptsx1473503730.png' },
  { name: 'Real Oviedo', shortCode: 'OVI', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/yuwqus1447590681.png' },
  { name: 'Real Sociedad B', shortCode: 'RSB', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/hliq4n1579632023.png' },
  { name: 'Real Valladolid CF', shortCode: 'VLL', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/bnhu8b1719983736.png' },
  { name: 'CE Sabadell FC', shortCode: 'SAB', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/21mapu1690094066.png' },
  { name: 'Real Sporting de Gijón', shortCode: 'SPO', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/xxrtqx1473503054.png' },
  { name: 'CD Tenerife', shortCode: 'TEN', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/utuqys1420503958.png' },
];

// Liga F Moeve 2026/27, 16 clubes — nombres confirmados vía Wikipedia.
// Escudos pendientes salvo los 3 ya localizados en TheSportsDB antes del
// rate-limit (429); el resto cae al código de 3 letras hasta completarlo.
const LIGAF_TEAMS: TeamInfo[] = [
  { name: 'Deportivo Alavés', shortCode: 'ALA' },
  { name: 'Athletic Club', shortCode: 'ATH' },
  { name: 'Atlético de Madrid', shortCode: 'ATM', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/n50qxy1719566251.png' },
  { name: 'FC Barcelona', shortCode: 'FCB', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/2we5kr1641409884.png' },
  { name: 'Badalona Women', shortCode: 'BDN', crestUrl: 'https://r2.thesportsdb.com/images/media/team/badge/hqgbe91753204520.png' },
  { name: 'Deportivo Abanca', shortCode: 'ABA' },
  { name: 'SD Eibar', shortCode: 'EIB' },
  { name: 'RCD Espanyol', shortCode: 'ESP' },
  { name: 'Granada CF', shortCode: 'GRA' },
  { name: 'Logroño United', shortCode: 'LOG' },
  { name: 'Madrid CFF', shortCode: 'MCF' },
  { name: 'Real Madrid', shortCode: 'RMA' },
  { name: 'Real Sociedad', shortCode: 'RSO' },
  { name: 'Sevilla FC', shortCode: 'SEV' },
  { name: 'CD Tenerife', shortCode: 'TEN' },
  { name: 'Valencia CF', shortCode: 'VAL' },
];

export const TEAMS_BY_COMPETICION: Record<Competicion, TeamInfo[]> = {
  laliga: LALIGA_TEAMS,
  segunda: SEGUNDA_TEAMS,
  ligaf: LIGAF_TEAMS,
};

export function findTeam(competicion: Competicion, name: string): TeamInfo | undefined {
  return TEAMS_BY_COMPETICION[competicion].find((t) => t.name === name);
}
