import assert from "node:assert/strict";
import test from "node:test";

const { localizeWorkContent } = await import("../lib/workAssets.ts");

test("removes an incomplete WordPress PDF until a local PDF is synced", () => {
  const source = '<p><a href="https://example.com/posters.pdf">PDF</a></p>';
  assert.equal(localizeWorkContent("unsynced-work", source), "<p></p>");
});

test("rewrites a synced work PDF to its durable local URL", () => {
  const source = '<p><a href="https://example.com/posters.pdf">PDF</a></p>';
  assert.equal(
    localizeWorkContent("ci-works", source),
    '<p><a href="/works/ci-works.pdf">PDF</a></p>'
  );
});
