# Quiniela

Visualización mobile-first de una quiniela informal entre amigos: partidos de LaLiga,
Segunda División y Liga F elegidos a mano cada jornada, columnas de pronósticos 1X2 por
jugador, comparación en vivo contra resultados reales, histórico de jornadas y una
clasificación general.

## Vistas

- **En vivo** — carrusel horizontal de columnas de jugadores (una por jugador), con una
  columna favorita fijable (guardada en `localStorage`) que se abre por defecto. Cada
  partido muestra el pronóstico coloreado: verde = acierto ya decidido, rojo = fallo ya
  decidido, neutro = pendiente.
- **Histórico** — listado de jornadas cerradas; reutiliza el mismo carrusel de columnas en
  modo estático.
- **Clasificación** — `POSICIÓN · NOMBRE · JORNADAS JUGADAS · JORNADAS GANADAS · ACIERTOS
  TOTALES`, ordenada por aciertos totales, con empates resueltos por jornadas ganadas y
  luego por menor número de jornadas jugadas. Se calcula en cliente a partir de las
  jornadas `cerrada` (ver `src/domain/quiniela.ts`, `computeClasificacion`).

## Modo edición (`/admin`)

Protegido con Supabase Auth (email+contraseña). Desde ahí el creador crea jornadas, añade
los partidos de cada una (equipos, competición, kickoff y, opcionalmente, el
`api_fixture_id` de API-Football para sincronización automática), define las columnas
(pronóstico 1X2) de cada jugador y cierra la jornada cuando termina.

## Datos y resultados en vivo

Persistencia en el proyecto Supabase compartido del ecosistema GalbaHUB (mismo que
IASport/Equix/LaMulTAB), tablas `quiniela_*` — DDL completo (tablas + políticas RLS) en
`src/dbService.ts`, función `getDDL()`.

Los resultados en vivo se sincronizan desde API-Football (api-sports.io) a través de una
función serverless (`api/quiniela-live.ts`, vive en la raíz del repo `GalbaHub` una vez
integrada, no aquí) que se autolimita a como mucho una llamada a la API cada 15 minutos
para no agotar el plan gratuito (100 peticiones/día). El frontend puede pedirle un refresco
cada 60s sin coste extra; es la función la que decide si de verdad hace falta llamar a
API-Football.

Sin `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configuradas, la app cae a un estado de
ejemplo en `localStorage` para poder desarrollar y probar la interfaz sin credenciales.

## Desarrollo

```bash
npm install
npm run dev
```

## Integración en GalbaHUB

Esta app es Nivel 1 (madura de forma independiente) y se integra en `GalbaHub` mediante
`git subtree`, siguiendo ADR-001 del ecosistema. En build de producción usa
`base: '/quiniela/'` (ver `vite.config.ts`).
