import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

import assetManifest from "../content/work-assets.mjs";

const entry = assetManifest["ci-works"];

const expected = [
  ["Frame 35", "/images/works/ci-works/ci-works-01-frame-35.jpg", 7482, 3818],
  ["Frame 34 (a)", "/images/works/ci-works/ci-works-02-frame-34-a.jpg", 7487, 3513],
  ["Frame 26", "/images/works/ci-works/ci-works-08-frame-26.png", 7659, 3678],
];

test("ci-works manifest contains only the bounded city-compassion asset set", async () => {
  assert.equal(entry.expectedPosters, expected.length);
  assert.equal(entry.embeds.length, expected.length);
  assert.equal(entry.cover, "/images/works/ci-works/ci-works-cover.jpg");

  for (const [index, [name, image, width, height]] of expected.entries()) {
    const asset = entry.embeds[index];
    assert.deepEqual(
      [asset.name, asset.image, asset.width, asset.height],
      [name, image, width, height],
    );
    assert.equal(asset.aspect, width / height);
    await access(new URL(`../public${image}`, import.meta.url));
  }
});
