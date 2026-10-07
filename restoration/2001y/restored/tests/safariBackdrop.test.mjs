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

test("mobile work overlay avoids nested Safari backdrop compositing", () => {
  assert.match(
    worksSource,
    /@media\s*\(max-width:\s*800px\)[\s\S]*?backdrop-filter:\s*none;[\s\S]*?-webkit-backdrop-filter:\s*none;/,
  );
  assert.match(
    carouselSource,
    /@media\s*\(max-width:\s*800px\)[\s\S]*?backdrop-filter:\s*none;[\s\S]*?-webkit-backdrop-filter:\s*none;/,
  );
  assert.match(
    worksSource,
    /@media\s*\(max-width:\s*800px\)[\s\S]*?opacity:\s*1;[\s\S]*?\.main\s*\{[\s\S]*?transform:\s*translateY\(0\);[\s\S]*?transition:\s*none;/,
  );
  assert.match(
    worksSource,
    /\.wrap[\s\S]*?height:\s*var\(--100vh\);[\s\S]*?min-height:\s*100vh;[\s\S]*?\.WorksOverlay[\s\S]*?height:\s*var\(--100vh\);[\s\S]*?min-height:\s*100vh;/,
  );
});