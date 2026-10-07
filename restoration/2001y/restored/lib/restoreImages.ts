import media from '../content/media-assets.json';
import { mediaLocation } from './mediaFallback';
export function restoreImages(html: string) {
  // Preserve genuine image bytes while avoiding mixed-content requests.
  return html.replace(/(<img\b[^>]*\bsrc=)(["'])(http:\/\/[^"']+)\2/gi,
    (tag, prefix, quote, source) => {
      const original = source.replace(/&amp;/g, '&');
      const local = mediaLocation(media[original] || media[decodeURI(original)]);
      return local ? prefix + quote + local + quote : tag;
    });
}
