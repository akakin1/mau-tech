import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../pages/works/[slug].tsx", import.meta.url), "utf8");

test("work detail uses the static selected work during client route hydration", () => {
  assert.match(source, /export default function Output\(\{ res, selectedWork, cat \}\)/);
  assert.match(source, /<Works_view res=\{selectedWork\} \/>/);
  assert.match(
    source,
    /const selectedWork = res\.find\(\(e\) => encodeURI\(decodeURI\(e\.slug\)\) == encodeURI\(String\(params\.slug\)\)\);/,
  );
  assert.match(source, /selectedWork,\s*\n\s*cat,/);
});