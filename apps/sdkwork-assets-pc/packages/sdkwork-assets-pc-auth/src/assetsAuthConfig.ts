import type {
  SdkworkAuthAppearanceConfig,
  SdkworkAuthRuntimeConfig,
} from '@sdkwork/auth-pc-react';
import { readAssetsViteEnv } from '@sdkwork/assets-pc-commons';

const ASSETS_VERIFICATION_POLICY = {
  emailCodeLoginEnabled: false,
  emailRegistrationVerificationRequired: false,
  phoneCodeLoginEnabled: false,
  phoneRegistrationVerificationRequired: false,
} as const;

export function resolveAssetsAuthRuntimeConfig(): SdkworkAuthRuntimeConfig {
  const config: SdkworkAuthRuntimeConfig = {
    leftRailMode: 'qr-only',
    loginMethods: ['password'],
    oauthLoginEnabled: false,
    oauthProviders: [],
    qrLoginEnabled: true,
    recoveryMethods: [],
    registerMethods: ['email', 'phone'],
    verificationPolicy: ASSETS_VERIFICATION_POLICY,
  };

  if (import.meta.env.PROD) {
    const leakedEmail = readAssetsViteEnv('VITE_SDKWORK_ASSETS_AUTH_DEV_EMAIL');
    const leakedPassword = readAssetsViteEnv('VITE_SDKWORK_ASSETS_AUTH_DEV_PASSWORD');
    if (leakedEmail || leakedPassword) {
      throw new Error(
        'VITE_SDKWORK_ASSETS_AUTH_DEV_* must not be present in production builds.',
      );
    }
  }

  if (import.meta.env.DEV) {
    const email = readAssetsViteEnv('VITE_SDKWORK_ASSETS_AUTH_DEV_EMAIL');
    const password = readAssetsViteEnv('VITE_SDKWORK_ASSETS_AUTH_DEV_PASSWORD');
    if (email && password) {
      config.developmentPrefill = { email, password };
    }
  }

  return config;
}

export function resolveAssetsAuthAppearance(): SdkworkAuthAppearanceConfig {
  return {
    pageClassName: 'sdkwork-assets-auth-page',
    shellClassName: 'sdkwork-assets-auth-card-shell',
    slotProps: {
      page: { className: 'sdkwork-assets-auth-page' },
      shell: { className: 'sdkwork-assets-auth-card-shell' },
    },
  };
}

export function resolveAssetsAuthLocale(appLanguage?: string): string | null {
  if (!appLanguage) {
    return null;
  }
  if (appLanguage.startsWith('zh')) {
    return 'zh-CN';
  }
  if (appLanguage.startsWith('en')) {
    return 'en-US';
  }
  return appLanguage;
}
