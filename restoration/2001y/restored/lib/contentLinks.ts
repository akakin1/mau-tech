export function restoreContentLink(href: string) {
  if (!href) return href;
  // The CMS contains a URL-encoded external RightFont link.
  if (/^https?%3a%2f%2f/i.test(href)) {
    try { return decodeURIComponent(href); } catch { return href; }
  }
  try {
    const url = new URL(href);
    if (url.hostname.toLowerCase() === '2001y.me' && /^\/(blog|works|about|search)(\/|$)/.test(url.pathname)) {
      return url.pathname + url.search + url.hash;
    }
  } catch {}
  return href;
}
