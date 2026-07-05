import { describe, expect, it } from 'vitest';
import { getPlatformApiGatewayHttpUrl } from './iam/assetsEnvironment';

describe('assets core', () => {
  it('resolves platform gateway url', () => {
    expect(getPlatformApiGatewayHttpUrl()).toBeTruthy();
  });
});
