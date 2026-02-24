const esbuild = require('esbuild');

const common = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: false,
};

// CJS Build
esbuild.build({
  ...common,
  format: 'cjs',
  platform: 'node',
  outfile: 'dist/index.js',
}).catch(() => process.exit(1));

// ESM Build
esbuild.build({
  ...common,
  format: 'esm',
  outfile: 'dist/index.mjs',
}).catch(() => process.exit(1));
