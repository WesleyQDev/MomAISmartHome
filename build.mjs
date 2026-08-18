import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = path.dirname(fileURLToPath(import.meta.url))
let esbuild
try {
  esbuild = require('esbuild')
} catch {
  try {
    esbuild = require(path.join(root, '..', 'momai', 'node_modules', 'esbuild'))
  } catch {}
}
const pageEntry = path.join(root, 'src', 'page.tsx')
const pageOutfile = path.join(root, 'dist', 'page.js')
const panelEntry = path.join(root, 'src', 'panel.tsx')
const panelOutfile = path.join(root, 'dist', 'panel.js')

if (esbuild?.build) {
  await esbuild.build({
    entryPoints: [pageEntry],
    outfile: pageOutfile,
    bundle: true,
    format: 'esm',
    target: 'es2020',
    external: ['react', 'react-dom', 'react/jsx-runtime']
  })
  await esbuild.build({
    entryPoints: [panelEntry],
    outfile: panelOutfile,
    bundle: true,
    format: 'esm',
    target: 'es2020',
    external: ['react', 'react-dom', 'react/jsx-runtime']
  })
  console.log('[momai-smart-home] build done (via programmatic esbuild)')
} else {
  const { execSync } = await import('node:child_process')
  execSync(`npx esbuild "${pageEntry}" --bundle --format=esm --target=es2020 --outfile="${pageOutfile}" --external:react --external:react-dom --external:react/jsx-runtime`, {
    stdio: 'inherit',
    cwd: root
  })
  execSync(`npx esbuild "${panelEntry}" --bundle --format=esm --target=es2020 --outfile="${panelOutfile}" --external:react --external:react-dom --external:react/jsx-runtime`, {
    stdio: 'inherit',
    cwd: root
  })
  console.log('[momai-smart-home] build done')
}
