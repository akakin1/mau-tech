import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/widget/WorksList.jsx", import.meta.url),
  "utf8",
);

test("works list guards private or embedded-browser sessionStorage access", () => {
  assert.match(source, /const readScrollPosition = \(\) => \{\s*try \{/s);
  assert.match(source, /const saveScrollPosition = \(value\) => \{\s*try \{/s);
  assert.match(source, /if \(!elm\) return;/);
  assert.equal((source.match(/sessionStorage\.getItem/g) || []).length, 1);
  assert.equal((source.match(/sessionStorage\.setItem/g) || []).length, 1);
});
