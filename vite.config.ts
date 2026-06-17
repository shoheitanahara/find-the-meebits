import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const meebitsVrmProxy = {
  target: 'https://files.meebits.app',
  changeOrigin: true,
  rewrite: (path: string) => path.replace(/^\/api\/vrm\/(\d+)$/, '/vrm/$1.vrm'),
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/vrm': meebitsVrmProxy,
    },
  },
  preview: {
    proxy: {
      '/api/vrm': meebitsVrmProxy,
    },
  },
})
