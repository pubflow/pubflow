// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import { dts } from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: 'json' };

// Define external dependencies
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

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
        tsconfigOverride: {
          compilerOptions: {
            jsx: 'react'
          }
        },
        useTsconfigDeclarationDir: true
      }),
      json()
    ],
    external
  },
  
  // Runtime modules
  {
    input: 'src/runtime/index.ts',
    output: [
      {
        file: 'dist/runtime/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/runtime/index.mjs',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [typescript(), json()],
    external
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
    plugins: [typescript({
      tsconfigOverride: {
        compilerOptions: {
          jsx: 'react'
        }
      }
    }), json()],
    external: ['react', 'react-dom', 'react-router-dom']
  },
  // Next.js adapter
  {
    input: 'src/adapters/next/index.tsx',
    output: [
      {
        file: 'dist/adapters/next/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/adapters/next/index.mjs',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [typescript({
      tsconfigOverride: {
        compilerOptions: {
          jsx: 'react'
        }
      }
    }), json()],
    external: ['react', 'react-dom', 'next', 'next/router']
  },
  // React Native adapter
  {
    input: 'src/adapters/react-native/index.ts',
    output: [
      {
        file: 'dist/adapters/react-native/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/adapters/react-native/index.mjs',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [typescript({
      tsconfigOverride: {
        compilerOptions: {
          jsx: 'react'
        }
      }
    }), json()],
    external: [
      'react', 
      'react-native', 
      '@react-native-async-storage/async-storage',
      'expo-constants',
      'expo-device',
      'expo-secure-store'
    ]
  },
  
  // Types
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  }
];

export default config;
