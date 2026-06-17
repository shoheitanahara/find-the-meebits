import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const meebitsVrmProxy = {
  target: 'https://files.meebits.app',
  changeOrigin: true,
  rewrite: (path: string) => path.replace(/^\/vrm\/(\d+)\.vrm$/, '/vrm/$1.vrm'),
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/vrm': meebitsVrmProxy,
    },
  },
  preview: {
    proxy: {
      '/vrm': meebitsVrmProxy,
    },
  },
})
