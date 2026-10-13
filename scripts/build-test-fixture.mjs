import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Exercise cooking interactions with fixed sample data without publishing it
// or depending on the owner's current collection of recipes.
const root = process.cwd();
const fixture = path.join(root, '.cookbook-test-site');
fs.rmSync(fixture, { recursive: true, force: true });
fs.mkdirSync(path.join(fixture, 'content'), { recursive: true });
for (const directory of ['src', 'public']) {
  fs.cpSync(path.join(root, directory), path.join(fixture, directory), { recursive: true });
}
for (const file of ['package.json', 'astro.config.mjs', 'tsconfig.json']) {
  fs.copyFileSync(path.join(root, file), path.join(fixture, file));
}
fs.cpSync(path.join(root, 'tests/fixtures/recipes'), path.join(fixture, 'content/recipes'), { recursive: true });
fs.copyFileSync(path.join(root, 'tests/fixtures/site.json'), path.join(fixture, 'content/site.json'));
fs.symlinkSync(path.join(root, 'node_modules'), path.join(fixture, 'node_modules'), 'dir');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/astro.js'), 'build'], {
  cwd: fixture,
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
