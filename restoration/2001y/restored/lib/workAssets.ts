import assetManifest from "../content/work-assets.mjs";
import { getStableWorkEmbeds } from "./worksEmbeds.mjs";

type WorkAsset = {
  image: string;
  name?: string;
  width?: number;
  height?: number;
  aspect?: number;
};

type WorkAssetEntry = {
  cover?: string;
  embeds?: WorkAsset[];
  pdf?: string;
  expectedPosters?: number;
};

const manifest = assetManifest as Record<string, WorkAssetEntry>;

export function getWorkAssets(slug: string): WorkAssetEntry | undefined {
  return manifest[slug];
}

export function getWorkEmbeds(slug: string, fields: Parameters<typeof getStableWorkEmbeds>[0]) {
  const localEmbeds = getWorkAssets(slug)?.embeds;
  if (localEmbeds?.length) return localEmbeds;
  return getStableWorkEmbeds(fields);
}

export function localizeWorkContent(slug: string, content: string): string {
  const pdf = getWorkAssets(slug)?.pdf;
  const pdfLink = /<a\b[^>]*href=(['"])https?:[^"']+\.pdf(?:[?#][^"']*)?\1[^>]*>[\s\S]*?<\/a>/gi;
  if (!pdf) return content.replace(pdfLink, "");

  return content.replace(/https?:[^"'\s>]+\.pdf(?:[?#][^"'\s>]*)?/gi, pdf);
}