// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import { dts } from 'rollup-plugin-dts';
import pkg from './package.json';

const config = [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true
      })
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]
  },
  // React adapter
  {
    input: 'src/adapters/react/index.ts',
    output: [
      {
        file: 'dist/adapters/react/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/adapters/react/index.mjs',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [typescript()],
    external: ['react', 'react-dom']
  },
  // Add similar configurations for other adapters...
  
  // Types
  {
    input: 'dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];

export default config;