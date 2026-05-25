import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { versionInfoUtil } from '../../common/utils/versionInfoUtil'
import pkg from './package.json'
import { VitePWA } from 'vite-plugin-pwa'
import manifest from "./manifest.json"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      legacy(),
      VitePWA({
        registerType: "autoUpdate", // Automatically updates the service worker, check if this correct to aut update or we should go with prompt support
        selfDestroying: true, // Unregisters any existing service worker and clears cache,
        manifest: manifest as any,
        devOptions: {
          enabled: true
        }
      })
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
      port: 8100
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})
