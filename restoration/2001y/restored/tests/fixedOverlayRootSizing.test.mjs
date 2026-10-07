import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../styles/globals.scss", import.meta.url),
  "utf8",
);

test("the app root keeps fixed overlays inside a viewport-sized root", () => {
  assert.match(source, /html,\s*body,\s*#__next\s*\{[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*100%;/);
});
