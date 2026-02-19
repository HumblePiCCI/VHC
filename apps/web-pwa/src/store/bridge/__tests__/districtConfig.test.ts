import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadModule() {
  vi.resetModules();
  return import('../districtConfig');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getConfiguredDistrict', () => {
  it('returns env value when VITE_DEFAULT_DISTRICT_HASH is set', async () => {
    vi.stubEnv('VITE_DEFAULT_DISTRICT_HASH', 'us-ca-12-hash');
    const { getConfiguredDistrict } = await loadModule();

    expect(getConfiguredDistrict()).toBe('us-ca-12-hash');
  });

  it('returns season0 default when env is not set', async () => {
    const { getConfiguredDistrict } = await loadModule();

    expect(getConfiguredDistrict()).toBe('season0-default-district');
  });

  it('returns season0 default when env is empty string', async () => {
    vi.stubEnv('VITE_DEFAULT_DISTRICT_HASH', '   ');
    const { getConfiguredDistrict } = await loadModule();

    expect(getConfiguredDistrict()).toBe('season0-default-district');
  });
});
