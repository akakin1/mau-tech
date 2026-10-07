import media from "../content/media-assets.json";
import host from "../content/media-host.json";
export function mediaLocation(value?: string) {
  return value?.startsWith('/media/') ? host.origin + value : value;
}
export function fallbackFor(source: string) {
  let url = source;
  try {
    const parsed = new URL(source, "https://2001y.me");
    if (parsed.pathname === "/_next/image") url = parsed.searchParams.get("url") || source;
  } catch {}
  return mediaLocation(media[url] || media[decodeURI(url)]);
}
