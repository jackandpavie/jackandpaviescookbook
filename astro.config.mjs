import { defineConfig } from 'astro/config';
// GitHub Actions provides the real URL and repository subpath automatically.
export default defineConfig({
  site: process.env.SITE_URL || 'https://our-little-cookbook.blithelamp9.chatgpt.site',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' }
});
