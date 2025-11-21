import { defineConfig } from 'vitest/config';
import path from 'node:path';

const CRYPTO_SRC = path.resolve(__dirname, '../crypto/src/index.ts');

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      '@vh/crypto': CRYPTO_SRC
    }
  }
});
