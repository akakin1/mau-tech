import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const source = path.join(root,'restored');
const result = spawnSync(process.execPath, [path.join(source,'node_modules/next/dist/bin/next'),'build'], {
  cwd:source, stdio:'inherit', env:{...process.env, NEXT_TELEMETRY_DISABLED:'1',
    NODE_OPTIONS:(process.env.NODE_OPTIONS || '')+' --require '+JSON.stringify(path.join(source,'scripts/build-cache.cjs'))}
});
if (result.status !== 0) process.exit(result.status || 1);
fs.rmSync(path.join(root,'out'),{recursive:true,force:true});
fs.cpSync(path.join(source,'out'),path.join(root,'out'),{recursive:true});
// Keep all originals in source; serve unchanged mirror bytes from the cache.
// Split deployment archives to respect the host's 256 MiB input limit.
fs.rmSync(path.join(root,'out/media'),{recursive:true,force:true});
const hosting = spawnSync(process.execPath, [path.join(root,'scripts/prepare-hosting.mjs')], {cwd:root,stdio:'inherit'});
if (hosting.status !== 0) process.exit(hosting.status || 1);
const sitemap = fs.readFileSync(path.join(root,'out/sitemap-0.xml'),'utf8');
console.log('Static export prepared; sitemap reference URLs:',(sitemap.match(/<loc>/g)||[]).length);
