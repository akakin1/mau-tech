// Preserve native Japanese word wrapping without making it a browser prerequisite.
const segmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter("ja-JP", { granularity: "word" })
  : null;

export function segmentTitle(title = "") {
  if (segmenter) return Array.from(segmenter.segment(title));
  let index = 0;
  return Array.from(title, segment => {
    const token = { segment, index };
    index += segment.length;
    return token;
  });
}
