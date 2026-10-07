import assert from "node:assert/strict";
import test from "node:test";

const { makePosterPdf, selectFrames } = await import("../scripts/sync-figma-assets.mjs");

const onePixelJpeg = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AYf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AYf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Aqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8QH//Z",
  "base64"
);

test("builds a PDF with one page per synced poster", async () => {
  const pdf = makePosterPdf([onePixelJpeg, onePixelJpeg]);
  assert.equal(pdf.subarray(0, 8).toString(), "%PDF-1.4");
  assert.match(pdf.toString(), /\/Count 2/);
});

test("ci-works sync selects only the verified city-compassion frames", () => {
  const page = {
    children: [
      { type: "FRAME", id: "wrong", name: "Frame 30", absoluteBoundingBox: { x: 0, y: 0 } },
      { type: "FRAME", id: "cover", name: "Frame 35", absoluteBoundingBox: { x: 1, y: 0 } },
      { type: "FRAME", id: "field", name: "Frame 34 (a)", absoluteBoundingBox: { x: 2, y: 0 } },
      { type: "FRAME", id: "city", name: "Frame 26", absoluteBoundingBox: { x: 3, y: 0 } },
    ],
  };

  assert.deepEqual(
    selectFrames(page, "ci-works").map((frame) => frame.name),
    ["Frame 35", "Frame 34 (a)", "Frame 26"],
  );
  assert.throws(
    () => selectFrames(page, "ci-works", "Frame 35,Missing frame"),
    /missing selected frame/i,
  );
});