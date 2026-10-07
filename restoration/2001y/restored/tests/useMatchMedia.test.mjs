import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../lib/useMatchMedia.ts", import.meta.url), "utf8");

test("matchMedia uses the current listener API with safe fallbacks", () => {
  assert.match(source, /window\.matchMedia\?\./);
  assert.match(source, /if \(!mediaQuery\) return;/);
  assert.match(source, /mediaQuery\.addEventListener\("change", handleMediaChange\)/);
  assert.match(source, /mediaQuery\.removeEventListener\("change", handleMediaChange\)/);
  assert.match(source, /mediaQuery\.addListener\(handleMediaChange\)/);
  assert.match(source, /mediaQuery\.removeListener\(handleMediaChange\)/);
});
