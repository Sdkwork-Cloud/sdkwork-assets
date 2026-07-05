import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { browserSecurityHeadersPlugin } from './config/browser/securityHeaders';

const DEFAULT_PLATFORM_API_GATEWAY_TARGET = 'http://127.0.0.1:3900';

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname);
  const env = loadEnv(mode, envDir, '');

  if (mode === 'production') {
    const devEmail = env.VITE_SDKWORK_ASSETS_AUTH_DEV_EMAIL;
    const devPassword = env.VITE_SDKWORK_ASSETS_AUTH_DEV_PASSWORD;
    if (devEmail || devPassword) {
      throw new Error(
        'VITE_SDKWORK_ASSETS_AUTH_DEV_* must not be set in production builds. '
        + 'Remove dev auth prefill from the build environment before retrying.',
      );
    }
  }

  const deploymentProfile = (
    env.VITE_SDKWORK_ASSETS_DEPLOYMENT_PROFILE
    || process.env.VITE_SDKWORK_ASSETS_DEPLOYMENT_PROFILE
    || 'standalone'
  ).toLowerCase();
  const isStandaloneProfile = deploymentProfile === 'standalone';

  const platformApiGatewayTarget =
    env.VITE_SDKWORK_ASSETS_PLATFORM_API_GATEWAY_HTTP_URL
    || process.env.VITE_SDKWORK_ASSETS_PLATFORM_API_GATEWAY_HTTP_URL
    || env.VITE_SDKWORK_APPBASE_APP_API_BASE_URL
    || process.env.VITE_SDKWORK_APPBASE_APP_API_BASE_URL
    || DEFAULT_PLATFORM_API_GATEWAY_TARGET;
  const appApiTarget =
    env.VITE_SDKWORK_ASSETS_APPLICATION_PUBLIC_HTTP_URL
    || process.env.VITE_SDKWORK_ASSETS_APPLICATION_PUBLIC_HTTP_URL
    || 'http://127.0.0.1:4180';
  const iamAppApiTarget =
    env.VITE_SDKWORK_IAM_APP_API_BASE_URL
    || process.env.VITE_SDKWORK_IAM_APP_API_BASE_URL
    || platformApiGatewayTarget;

  const appIngressTarget = isStandaloneProfile ? appApiTarget : platformApiGatewayTarget;
  const standaloneProxy = {
    '/app/v3/api': {
      target: appIngressTarget,
      changeOrigin: true,
    },
  };
  const cloudProxy = {
    '/app/v3/api/oauth': {
      target: iamAppApiTarget,
      changeOrigin: true,
    },
    '/app/v3/api/auth': {
      target: iamAppApiTarget,
      changeOrigin: true,
    },
    '/app/v3/api': {
      target: platformApiGatewayTarget,
      changeOrigin: true,
    },
  };

  return {
    envDir,
    plugins: [react(), tailwindcss(), browserSecurityHeadersPlugin(mode === 'development')],
    define: {
      __SDKWORK_ASSETS_ENV__: JSON.stringify({
        ...env,
        MODE: mode,
        VITE_APP_ENV: env.VITE_APP_ENV || mode,
      }),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }
            if (
              id.includes('/node_modules/react/')
              || id.includes('/node_modules/react-dom/')
              || id.includes('/node_modules/react-router')
              || id.includes('/node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('@sdkwork/auth-pc-react') || id.includes('@sdkwork/auth-runtime-pc-react')) {
              return 'vendor-auth';
            }
            return undefined;
          },
        },
      },
    },
    server: {
      port: 4180,
      host: '127.0.0.1',
      strictPort: true,
      fs: {
        allow: [path.resolve(__dirname, '../..')],
      },
      proxy: isStandaloneProfile ? standaloneProxy : cloudProxy,
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  };
});
