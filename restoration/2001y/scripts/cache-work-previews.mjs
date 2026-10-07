// Cache the existing WordPress derivatives, never crop or replace the photographs.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const sharp = createRequire(new URL('../restored/package.json', import.meta.url))('sharp');
const repo = process.cwd();
const baseline = path.resolve(repo, '../../output/y2001-restoration/baseline');
const companion = path.resolve(repo, '../y2001-restoration-media/dist');
const records = (await Promise.all((await fs.readdir(baseline))
  .filter(file => /^wp-media.*json$/.test(file))
  .map(async file => JSON.parse(await fs.readFile(path.join(baseline, file), 'utf8'))))).flat();
const captures = JSON.parse(await fs.readFile('restored/content/live-works.json', 'utf8'));
const works = Object.values(captures)[0].res;
const urls = new Set(works.map(work => work.cfs.img));
for (const capture of Object.values(captures)) {
  for (const slide of capture.selectedWork.cfs.embed || []) if (slide.image) urls.add(slide.image);
}
const manifest = JSON.parse(await fs.readFile('restored/content/media-assets.json', 'utf8'));
const previews = {};
const tasks = new Map();
for (const url of urls) {
  const record = records.find(record => record.source_url === url);
  if (!record) continue;
  const sizes = record.media_details.sizes;
  const candidates = [sizes.medium_large, sizes['1536x1536'] || sizes.large]
    .filter(size => size && size.width < record.media_details.width && size.width >= 600);
  const distinct = [...new Map(candidates.map(size => [size.width, size])).values()].sort((a,b) => a.width-b.width);
  if (!distinct.length) continue;
  previews[url] = distinct.map(size => ({src:size.source_url,width:size.width}));
  for (const size of distinct) tasks.set(size.source_url, size);
}
let queue = [...tasks.values()];
let bytes = 0;
await Promise.all(Array.from({length:6}, async () => {
  while (queue.length) {
    const size = queue.shift();
    const url = size.source_url;
    const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0,20);
    const file = '/media/' + hash + path.extname(new URL(url).pathname);
    const response = await fetch(url, {signal:AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error('Missing CMS derivative: ' + response.status + ' ' + url);
    const data = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(path.join(companion, file), data);
    manifest[url] = file;
    bytes += data.length;
  }
}));
// The recovered Figma frames have no CMS derivatives. Resize their exact source
// losslessly for normal display, retaining the originals at the original URLs.
const host = JSON.parse(await fs.readFile('restored/content/media-host.json', 'utf8')).origin;
for (const url of urls) {
  if (!url.startsWith('/images/works/ci-works/')) continue;
  previews[url] = [];
  for (const width of [768, 1536]) {
    const hash = crypto.createHash('sha256').update(url + ':' + width).digest('hex').slice(0,20);
    const file = '/media/' + hash + '.webp';
    const data = await sharp(path.join(repo, 'restored/public', url)).resize({width,withoutEnlargement:true}).webp({lossless:true}).toBuffer();
    await fs.writeFile(path.join(companion,file),data);
    previews[url].push({src:host+file,width});
    bytes += data.length;
  }
}
await fs.writeFile('restored/content/work-previews.json', JSON.stringify(previews,null,2)+'\n');
await fs.writeFile('restored/content/media-assets.json', JSON.stringify(manifest)+'\n');
console.log(JSON.stringify({covers:works.length,previewed:Object.keys(previews).length,files:tasks.size,bytes}));
