import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { segmentTitle } from '../lib/segmentTitle.mjs';

test('Japanese title wrapping preserves native segmentation and every character', () => {
  const text = '日本語の作品 Next.js\n写真 📷';
  const expected = Array.from(new Intl.Segmenter('ja-JP',{granularity:'word'}).segment(text));
  assert.deepEqual(segmentTitle(text), expected);
  assert.equal(segmentTitle(text).map(token=>token.segment).join(''), text);
});

test('loading a Works title on a browser without Intl.Segmenter does not throw', async () => {
  const source = await readFile(new URL('../lib/segmentTitle.mjs', import.meta.url), 'utf8');
  const context = vm.createContext({Intl:{}});
  vm.runInContext(source.replace('export function', 'function'), context);
  const text = '幼い時期\nNext.js 📷';
  const tokens = vm.runInContext('segmentTitle('+JSON.stringify(text)+')',context);
  assert.equal(tokens.map(token=>token.segment).join(''), text);
  assert.equal(tokens.at(-1).segment, '📷');
  assert.equal(tokens.at(-1).index, text.length - 2);
});
