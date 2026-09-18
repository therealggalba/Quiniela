import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // En producción se sirve bajo /quiniela/ dentro de GalbaHUB: una base
  // absoluta es necesaria para que los assets resuelvan bien. En local
  // (`vite dev`) se mantiene en la raíz. Mismo criterio que Equix/EliteBooker.
  base: command === 'build' ? '/quiniela/' : '/',
  plugins: [react()],
}))
