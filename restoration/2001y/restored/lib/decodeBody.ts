import { decode } from "html-entities";
// Old imported HTML uses escaped markup inside <pre>. Decoding it globally
// turns tutorial examples into live iframes/scripts and creates dead requests.
export function decodeBody(content: string) {
  return content.split(/(<pre\b[^>]*>[\s\S]*?<\/pre>)/gi)
    .map(part => /^<pre\b/i.test(part) ? part : decode(part)).join("");
}
