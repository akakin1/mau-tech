const FIGMA_IMAGE_HOSTS = new Set([
  "figma-alpha-api.s3.us-west-2.amazonaws.com",
  "s3-alpha.figma.com",
]);

function isFigmaImageUrl(value) {
  if (typeof value !== "string" || !value) return false;

  try {
    return FIGMA_IMAGE_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

function hasRenderableEmbed(embed) {
  return Boolean(
    (embed.image && !isFigmaImageUrl(embed.image)) ||
      embed.code ||
      embed.youtube
  );
}

/**
 * Return only assets that are safe to render at runtime.
 *
 * Figma's file-images endpoint returns temporary export URLs. They are useful
 * while synchronising assets, but must not become the public site's runtime
 * dependency. WordPress's cover image remains the explicit fallback until a
 * durable local asset manifest is populated.
 */
export function getStableWorkEmbeds(fields = {}) {
  const embeds = Array.isArray(fields.embed) ? fields.embed : [];
  const stableEmbeds = embeds.filter(hasRenderableEmbed);

  if (stableEmbeds.length > 0) return stableEmbeds;
  if (fields.img && !isFigmaImageUrl(fields.img)) {
    return [{ image: fields.img, name: "作品画像" }];
  }
  if (fields.youtube) return [{ youtube: fields.youtube }];

  return [];
}

export function isTemporaryFigmaImageUrl(value) {
  return isFigmaImageUrl(value);
}