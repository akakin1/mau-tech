// Build against the audited public CMS snapshot; runtime still uses WordPress.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const collections = {};
for (const name of ['posts','works','pages','categories','tags','works_cat','works_tag']) {
  collections[name] = JSON.parse(fs.readFileSync(path.join(root,'public/content/wp-'+name+'.json'),'utf8'));
}
collections.tagsByCount = JSON.parse(fs.readFileSync(path.join(root,'public/content/wp-tags-by-count.json'),'utf8'));
const nativeFetch = globalThis.fetch;
globalThis.fetch = async function(input, init) {
  const url = String(input instanceof Request ? input.url : input);
  if (!url.startsWith('https://yoshikitam.wpx.jp/2001y/wp-json/wp/v2/')) return nativeFetch(input, init);
  const { selectSnapshot } = await import('../lib/wordpressSnapshot.mjs');
  const location = new URL(url);
  const selected = selectSnapshot(collections, location.pathname, location.search);
  if (!selected) return nativeFetch(input, init);
  return new Response(JSON.stringify(selected.records), { headers: {
    'content-type':'application/json', 'x-wp-total':String(selected.total),
    'x-wp-totalpages':String(selected.totalpages)
  }});
};
