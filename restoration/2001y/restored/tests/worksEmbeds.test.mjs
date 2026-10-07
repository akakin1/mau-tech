import assert from "node:assert/strict";
import test from "node:test";

const { getStableWorkEmbeds, isTemporaryFigmaImageUrl } = await import(
  "../lib/worksEmbeds.mjs"
);

test("filters Figma export URLs and keeps durable embeds", () => {
  const result = getStableWorkEmbeds({
    img: "https://2001y.me/images/cover.jpg",
    embed: [
      {
        name: "temporary",
        image:
          "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/expired",
      },
      { name: "local", image: "/works/ci-works/poster-01.jpg" },
    ],
  });

  assert.deepEqual(result, [
    { name: "local", image: "/works/ci-works/poster-01.jpg" },
  ]);
});

test("falls back to the cover when only Figma metadata exists", () => {
  const result = getStableWorkEmbeds({
    img: "https://yoshikitam.wpx.jp/2001y/wp-content/uploads/cover.jpg",
    embed: [{ figma_fileID: "file", figma_pageName: "Page 1" }],
  });

  assert.deepEqual(result, [
    {
      image:
        "https://yoshikitam.wpx.jp/2001y/wp-content/uploads/cover.jpg",
      name: "作品画像",
    },
  ]);
});

test("does not silently classify Figma URLs as durable assets", () => {
  assert.equal(
    isTemporaryFigmaImageUrl(
      "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/id"
    ),
    true
  );
  assert.equal(isTemporaryFigmaImageUrl("/works/ci-works/poster.jpg"), false);
});