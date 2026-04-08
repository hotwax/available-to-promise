import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { versionInfoUtil } from '../../common/utils/versionInfoUtil'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      legacy()
    ],
    define: {
      'import.meta.env.VITE_APP_VERSION_INFO': JSON.stringify(JSON.stringify(versionInfoUtil.getVersionInfo(pkg.version)))
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@common': path.resolve(__dirname, '../../common')
      },
    },
    build: {
      target: 'es2015',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    server: {
      port: 8080
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})
