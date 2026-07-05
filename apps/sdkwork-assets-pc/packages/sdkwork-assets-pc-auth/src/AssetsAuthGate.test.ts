import { describe, expect, it } from 'vitest';

import {
  buildAssetsAuthLoginRedirect,
  resolveAssetsAuthGateDecision,
  sanitizeAssetsAuthRedirect,
} from './assetsAuthGateLogic';

describe('AssetsAuthGate decisions', () => {
  it('redirects unauthenticated users away from product routes when IAM is enforced', () => {
    const decision = resolveAssetsAuthGateDecision({
      hasSession: false,
      iamEnforced: true,
      location: { pathname: '/', search: '?tab=recent' },
    });

    expect(decision).toEqual({
      kind: 'redirect',
      replace: true,
      to: buildAssetsAuthLoginRedirect({ pathname: '/', search: '?tab=recent' }),
    });
  });

  it('allows auth routes while session is missing', () => {
    expect(
      resolveAssetsAuthGateDecision({
        hasSession: false,
        location: { pathname: '/auth/login' },
      }),
    ).toEqual({ kind: 'auth-route' });
  });

  it('sanitizes unsafe redirect targets', () => {
    expect(sanitizeAssetsAuthRedirect('//evil.example')).toBe('/');
    expect(sanitizeAssetsAuthRedirect('/auth/login')).toBe('/');
    expect(sanitizeAssetsAuthRedirect('/assets?kind=image')).toBe('/assets?kind=image');
  });
});
