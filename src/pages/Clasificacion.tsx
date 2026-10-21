import { useEffect, useState } from 'react';
import { dbService } from '../dbService';
import { computeClasificacion, computeJornadasPagadasPorJugador, type ClasificacionRow } from '../domain/quiniela';

export function Clasificacion() {
  const [rows, setRows] = useState<ClasificacionRow[]>([]);
  const [jornadasPagadas, setJornadasPagadas] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [players, jornadas, columnas, partidos] = await Promise.all([
        dbService.listPlayers(),
        dbService.listJornadas(),
        dbService.listAllColumnas(),
        dbService.listAllPartidos(),
      ]);
      setRows(computeClasificacion(players, jornadas, columnas, partidos));
      setJornadasPagadas(computeJornadasPagadasPorJugador(jornadas));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="empty-state">Cargando…</div>;

  if (rows.length === 0) {
    return <div className="empty-state">Todavía no hay ninguna jornada cerrada.</div>;
  }

  return (
    <div className="page page--clasificacion">
      <table className="tabla-clasificacion">
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Nombre</th>
            <th>J. jugadas</th>
            <th>J. ganadas</th>
            <th>Aciertos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const pagadas = jornadasPagadas.get(row.playerId) ?? 0;
            const rowClass =
              index === 0 ? 'fila-lider' : index === rows.length - 1 ? 'fila-farolillo' : undefined;
            return (
              <tr key={row.playerId} className={rowClass}>
                <td>{row.position}</td>
                <td>
                  {row.name}
                  {pagadas > 0 && (
                    <span className="pago-dots" title={`${pagadas} jornada(s) pagada(s)`}>
                      {Array.from({ length: pagadas }).map((_, i) => (
                        <span key={i} className="pago-dot" />
                      ))}
                    </span>
                  )}
                </td>
                <td>{row.jornadasJugadas}</td>
                <td>{row.jornadasGanadas}</td>
                <td>{row.aciertosTotales}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <section className="por-decidir" aria-labelledby="por-decidir-title">
        <h2 id="por-decidir-title">Puntos a debatir</h2>
        <ol>
          <li>
            <strong>Premio y castigo.</strong> ¿Premio para el ganador (jornadas igualadas) y castigo para el último
            clasificado?
          </li>
          <li>
            <strong>Reparto del dinero.</strong> Si se gana un dinero importante, ¿se reparte entre los 10 participantes
            o se lo queda solo el acertante? Mejor dejarlo claro antes de que pueda ocurrir.
          </li>
        </ol>
      </section>
    </div>
  );
}
