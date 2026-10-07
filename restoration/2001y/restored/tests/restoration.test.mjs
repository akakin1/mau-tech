import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { viewF } from '../lib/viewF.ts';
import { selectSnapshot } from '../lib/wordpressSnapshot.mjs';
import { decodeBody } from '../lib/decodeBody.ts';
const records = JSON.parse(fs.readFileSync(new URL('../public/content/wp-works.json',import.meta.url)));
test('desktop and mobile regrouping retain every work, including the final partial row',()=>{
  for(const level of [2,3.5,4.5]) {
    const rows=viewF(structuredClone(records),3.5);
    const result=viewF(rows,level).flat();
    assert.deepEqual(result.map(v=>v.id),records.map(v=>v.id));
    assert.ok(result.every(v=>Number.isFinite(v.imgSize.widthRate)));
  }
});
test('CMS fallback paginates every published post without omission or duplicate',()=>{
  const posts=JSON.parse(fs.readFileSync(new URL('../public/content/wp-posts.json',import.meta.url)));
  const all=[];for(let page=1;page<=Math.ceil(posts.length/18);page++)all.push(...selectSnapshot({posts},'/posts','?per_page=18&page='+page).records);
  assert.equal(all.length,327);assert.equal(new Set(all.map(v=>v.id)).size,327);
});
test('CMS fallback keeps encoded Japanese slugs and tag membership',()=>{
  const posts=JSON.parse(fs.readFileSync(new URL('../public/content/wp-posts.json',import.meta.url)));
  const tags=JSON.parse(fs.readFileSync(new URL('../public/content/wp-tags.json',import.meta.url)));
  const tagged=selectSnapshot({posts,tags},'/posts','?tags=418&per_page=100');assert.equal(tagged.total,14);
  const japanese=posts.find(v=>v.slug.includes('%'));
  assert.equal(selectSnapshot({posts},'/posts','?slug='+encodeURIComponent(decodeURIComponent(japanese.slug))).records[0].id,japanese.id);
});
test('legacy HTML code samples stay escaped while ordinary text is decoded',()=>{
  const source='A &amp; B<pre>&lt;iframe src=".txtファイルのURL"&gt;&lt;/iframe&gt;</pre>';
  assert.equal(decodeBody(source),'A & B<pre>&lt;iframe src=".txtファイルのURL"&gt;&lt;/iframe&gt;</pre>');
});
