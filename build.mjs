import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const pageEntry = path.join(root, 'src', 'page.tsx')
const pageOutfile = path.join(root, 'dist', 'page.js')
const panelEntry = path.join(root, 'src', 'panel.tsx')
const panelOutfile = path.join(root, 'dist', 'panel.js')

execSync(`npx esbuild "${pageEntry}" --bundle --format=esm --target=es2020 --outfile="${pageOutfile}" --external:react --external:react-dom --external:react/jsx-runtime`, {
  stdio: 'inherit',
  cwd: root
})

execSync(`npx esbuild "${panelEntry}" --bundle --format=esm --target=es2020 --outfile="${panelOutfile}" --external:react --external:react-dom --external:react/jsx-runtime`, {
  stdio: 'inherit',
  cwd: root
})

console.log('[momai-smart-home] build done')
