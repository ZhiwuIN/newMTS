import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
   resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // 解决转换后的静态资源路径问题 '/static' 改为 'src/static'
        '/static': path.resolve(__dirname, 'src/static')
      },
    },
})
