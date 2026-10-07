import fs from 'node:fs';
import assert from 'node:assert/strict';
const code=fs.readFileSync('dist/server/index.js','utf8');
const {default:adapter}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const env={ASSETS:{async fetch(request){return new Response(new URL(request.url).pathname)}}};
for(const pathname of ['/blog/web/bookmarklet-chrome','/blog/other/hello/','/blog/gadget/anker-powerport3-65w/']) {
  const response=await adapter.fetch(new Request('https://copy.example'+pathname),env);
  assert.equal(response.status,301);
  assert.ok(response.headers.get('location').startsWith('https://copy.example/blog/'));
}
const works=await adapter.fetch(new Request('https://copy.example/works?cat=design'),env);
assert.equal(works.status,307);
assert.equal(works.headers.get('location'),'https://copy.example/?cat=design');
const trailing=await adapter.fetch(new Request('https://copy.example/blog/jsx-map-trouble/'),env);
assert.equal(trailing.status,308);
assert.equal(trailing.headers.get('location'),'https://copy.example/blog/jsx-map-trouble');
for(const pathname of ['/','/about','/blog/jsx-map-trouble','/works/ci-works']) {
  const response=await adapter.fetch(new Request('https://copy.example'+pathname),env);
  assert.equal(await response.text(),pathname==='/'?'/_pages/index.txt':'/_pages'+pathname+'.txt');
  assert.equal(response.headers.get('content-type'),'text/html; charset=utf-8');
}
const image=await adapter.fetch(new Request('https://copy.example/images/example.jpg'),env);
assert.equal(await image.text(),'/images/example.jpg');
console.log('Hosting routing: legacy 301, Works 307, trailing slash 308, clean URLs and assets verified');
