import esbuild from 'esbuild'
import dotenv from 'dotenv'

dotenv.config()

esbuild
  .build({
    entryPoints: ['src/page.tsx'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/page.js',
    external: ['react', 'react-dom', 'react/jsx-runtime', '@heroicons/react'],
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
    define: {
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || ''),
      'process.env.GOOGLE_CLIENT_SECRET': JSON.stringify(process.env.GOOGLE_CLIENT_SECRET || '')
    }
  })
  .then(() => console.log('✅ Extension UI built successfully -> dist/page.js'))
  .catch(() => process.exit(1))
