import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

export default defineConfig({
  plugins: [uni(), basicSsl()],
  server: {
    host: '0.0.0.0',
    https: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/static': path.resolve(__dirname, 'src/static')
    },
  },
})

