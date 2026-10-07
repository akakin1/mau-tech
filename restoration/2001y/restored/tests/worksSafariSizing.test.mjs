import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const worksSource = readFileSync(
  new URL("../styles/works.module.scss", import.meta.url),
  "utf8",
);
const carouselSource = readFileSync(
  new URL("../styles/components/carousel.module.scss", import.meta.url),
  "utf8",
);

test("works listing sizing does not depend on CSS multiplication", () => {
  assert.match(worksSource, />\.work\s*\{[\s\S]*?flex:\s*var\(--aspect\)/);
  assert.match(worksSource, />\.work\s*\{[\s\S]*?aspect-ratio:\s*var\(--aspect\)/);
  assert.doesNotMatch(worksSource, /--width:\s*calc\([^;]*\*/);
});

test("work carousel sizing uses Safari-compatible intrinsic aspect sizing", () => {
  assert.match(carouselSource, /\.thumbnail\s*\{[\s\S]*?width:\s*var\(--tmb_width\)/);
  assert.match(carouselSource, /\.thumbnail\s*\{[\s\S]*?height:\s*auto/);
  assert.doesNotMatch(carouselSource, /55vh\s*\*\s*var\(--aspect\)/);
});
