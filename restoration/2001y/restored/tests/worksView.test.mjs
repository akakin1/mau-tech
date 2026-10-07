import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../components/widget/Works_view.jsx", import.meta.url), "utf8");

test("works detail is visible during SSR before hydration", () => {
  assert.match(source, /useState\(true\)/);
  assert.doesNotMatch(source, /useState\(false\)/);
});
