import { defineConfig } from 'vite';

// GitHub Pages'de deploy edilirken DEPLOY_TARGET=github olarak set edilmeli.
// Vercel veya local'de bu env yoktur, base '/' olur.
const isGitHubPages = process.env.DEPLOY_TARGET === 'github';

export default defineConfig({
  root: '.',
  base: isGitHubPages ? '/PalindromeRunner/' : '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
