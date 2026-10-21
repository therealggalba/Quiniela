import { useEffect, useRef } from 'react';

const QUINIELA_URL = 'https://www.loteriasyapuestas.es/es/resultados/quiniela';

interface Props {
  onClose: () => void;
}

/**
 * Ventana centrada con las normas e información de la quiniela del grupo.
 * Se cierra con la X, pulsando fuera o con Escape; mientras está abierta el
 * foco empieza en el botón de cierre (accesible con teclado y lectores).
 */
export function InfoModal({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <h2 id="info-title">Sobre la Quiniela</h2>
            <p className="modal__subtitle">Grupo de trabajadores de Euronutra</p>
          </div>
          <button ref={closeRef} type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="modal__body">
          <section className="info-block">
            <h3>
              <span className="info-block__num">1</span>Quién juega
            </h3>
            <p>
              Esta quiniela es del grupo de trabajadores de <strong>Euronutra</strong>. Esta aplicación solo sirve para
              seguir los resultados y la clasificación; las apuestas se hacen en papel.
            </p>
          </section>

          <section className="info-block">
            <h3>
              <span className="info-block__num">2</span>Cómo se juega y se paga
            </h3>
            <p>
              La quiniela se lleva <strong>en persona a la empresa</strong> y se rellena <strong>a mano</strong>.
            </p>
            <p>
              Cada semana, un jugador se encarga de llevarla a un punto de venta oficial de Loterías y Apuestas del
              Estado para pagar la quiniela de esa semana. Las semanas pagadas se anotan con un{' '}
              <span className="pago-dot" aria-label="punto blanco" /> <strong>punto blanco</strong> junto al nombre en la
              clasificación general.
            </p>
            <p>Al final, el número de semanas pagadas debe quedar equilibrado entre todos los jugadores.</p>
          </section>

          <section className="info-block">
            <h3>
              <span className="info-block__num">3</span>Cuándo se rellena
            </h3>
            <ul>
              <li>
                Se rellena los <strong>jueves</strong>. Normalmente no está disponible antes del miércoles.
              </li>
              <li>
                Como muy tarde, se entrega el <strong>viernes por la tarde</strong>, antes de que empiece la jornada real.
              </li>
            </ul>
          </section>

          <section className="info-block">
            <h3>
              <span className="info-block__num">4</span>Si no puedes rellenarla tú
            </h3>
            <p>
              Consulta la quiniela de la semana en{' '}
              <a href={QUINIELA_URL} target="_blank" rel="noopener noreferrer">
                loteriasyapuestas.es
              </a>{' '}
              para ver los partidos y pídele a un compañero que la rellene en tu nombre.
            </p>
          </section>

          <section className="info-block">
            <h3>
              <span className="info-block__num">5</span>Cuando esté rellena
            </h3>
            <p>
              Se recomienda enviar una <strong>foto</strong> de la quiniela al creador de la app, <strong>GMR</strong>,
              para que pueda actualizar la información de la jornada.
            </p>
          </section>

          <section className="info-block">
            <h3>
              <span className="info-block__num">6</span>Si te pierdes jornadas
            </h3>
            <p>
              Para que todos tengamos las mismas jornadas disputadas y competir en igualdad, quien se haya perdido alguna
              puede jugar una <strong>quiniela especial fuera de la liga</strong> para ponerse al día (por ejemplo, de
              competiciones europeas o de selecciones), <strong>avisando antes</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
