import esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/page.tsx', 'src/panel.tsx'],
  outdir: 'dist',
  entryNames: '[name]',
  bundle: true,
  format: 'esm',
  external: ['react', 'react-dom', 'react/jsx-runtime', '@heroicons/react'],
  loader: { '.tsx': 'tsx', '.ts': 'ts' }
})

console.log('Build concluído -> dist/page.js e dist/panel.js')
