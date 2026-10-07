import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/widget/WorksList.jsx", import.meta.url),
  "utf8",
);

test("works list does not use a server-incompatible layout effect", () => {
  assert.doesNotMatch(source, /useLayoutEffect/);
  assert.match(source, /useEffect\(\(\) => \{\s*let elm = document\.querySelector\("#wrap"\)/s);
});
