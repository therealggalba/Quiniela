import { useState } from 'react';
import type { Competicion } from '../domain/quiniela';
import { TEAMS_BY_COMPETICION } from '../domain/teams';

const OTRO = '__otro__';

interface Props {
  competicion: Competicion;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function TeamSelect({ competicion, value, onChange, placeholder }: Props) {
  const catalogo = TEAMS_BY_COMPETICION[competicion];
  const enCatalogo = catalogo.some((t) => t.name === value);
  const [modoLibre, setModoLibre] = useState(catalogo.length === 0 || (value !== '' && !enCatalogo));

  if (catalogo.length === 0 || modoLibre) {
    return (
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={catalogo.length > 0 ? `equipos-${competicion}` : undefined}
      />
    );
  }

  return (
    <select
      value={enCatalogo ? value : ''}
      onChange={(e) => {
        if (e.target.value === OTRO) {
          setModoLibre(true);
          onChange('');
        } else {
          onChange(e.target.value);
        }
      }}
    >
      <option value="">— {placeholder} —</option>
      {catalogo.map((t) => (
        <option key={t.name} value={t.name}>
          {t.name}
        </option>
      ))}
      <option value={OTRO}>Otro (escribir)…</option>
    </select>
  );
}
