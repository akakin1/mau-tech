import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../pages/_app.tsx", import.meta.url), "utf8");

test("works routes cannot be hidden by the global loading layer", () => {
  assert.match(source, /const isWorksPath = \(path = \"\"\) =>/);
  assert.match(source, /path === \"\/\" \|\| path === \"\/works\"/);
  assert.match(source, /const visiblePageLoading =/);
  assert.ok(source.includes('isWorksPath(router.asPath.split("?")[0]) || isWorksPath(router.pathname)'));
  assert.ok(source.includes('const visiblePageLoading = pageLoading && !isWorksPage;'));
  assert.match(source, /<main[\s\S]*className=\{String\(visiblePageLoading\)\}/);
  assert.match(source, /style=\{isWorksPage \? \{ opacity: 1 \} : undefined\}/);
  assert.match(source, /loading \" \+ visiblePageLoading/);
});
