import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../styles/components/carousel.module.scss", import.meta.url),
  "utf8",
);

test("carousel sizing is explicit for Safari mobile layout", () => {
  assert.match(source, /\.thumbnail\s*\{[\s\S]*?width:\s*var\(--tmb_width\)/);
  assert.match(source, /\.thumbnail\s*\{[\s\S]*?height:\s*auto/);
  assert.match(source, /\.carousel\s*\{[\s\S]*?width:\s*100%;/);
  assert.match(source, /\.carousel\s*\{[\s\S]*?height:\s*100%;/);
});
