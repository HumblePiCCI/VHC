/**
 * Externalized district source of truth for constituency proof verification.
 * Season 0: configurable default district. Future: resolved from representative directory.
 * Spec: spec-identity-trust-constituency.md v0.2 §4.2
 */

const SEASON_0_DEFAULT_DISTRICT = 'season0-default-district';

export function getConfiguredDistrict(): string {
  const importMetaEnv = (import.meta as { env?: { VITE_DEFAULT_DISTRICT_HASH?: unknown } }).env;
  const processEnv = (globalThis as { process?: { env?: { VITE_DEFAULT_DISTRICT_HASH?: unknown } } }).process?.env;
  const envValue = importMetaEnv?.VITE_DEFAULT_DISTRICT_HASH ?? processEnv?.VITE_DEFAULT_DISTRICT_HASH;

  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    return envValue.trim();
  }

  return SEASON_0_DEFAULT_DISTRICT;
}
