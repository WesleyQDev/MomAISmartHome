import esbuild from 'esbuild'

esbuild
  .build({
    entryPoints: ['src/page.tsx'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/page.js',
    external: ['react', 'react-dom', 'react/jsx-runtime', '@heroicons/react'],
    loader: { '.tsx': 'tsx', '.ts': 'ts' }
  })
  .then(() => console.log('Build concluído -> dist/page.js'))
  .catch(() => process.exit(1))
