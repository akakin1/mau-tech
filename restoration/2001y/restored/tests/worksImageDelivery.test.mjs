import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const repoRoot = new URL("../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, repoRoot), "utf8");
}

test("works listing images bypass the Vercel image optimizer", async () => {
  const source = await read("components/widget/WorksList_post.jsx");
  assert.match(source, /<WorkImage[\s\S]*?unoptimized/);
});

test("work detail carousel images bypass the Vercel image optimizer", async () => {
  const source = await read("components/Carousel.tsx");
  assert.match(source, /<WorkImage[\s\S]*?unoptimized/);
});
