import { unified } from "unified";

// Markdown → HTML
import remarkParse from "remark-parse";
import remarkGfm from 'remark-gfm'
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrism from '@mapbox/rehype-prism';
import rehypeSlug from 'rehype-slug'
export function MDtoHTML(res) {
	return md(res);
}
async function md(res) {
	let result = await unified()
		.use(remarkParse)
		.use(remarkGfm) //表対応
		.use(remarkRehype, {
			allowDangerousHtml: true // <html>など
		})
		.use(rehypeSlug) //見出しにid
		.use(rehypePrism, {
			ignoreMissing: true  // 存在しない言語名を書いていた時に無視する
		})
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(res);
	return String(result);
}


import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import { createElement } from "react";

import CustomLink from "components/unified/link"

export async function HTMLtoJSX(res) {
	const processor = unified()
		.use(rehypeParse, { fragment: true }) // fragmentは必ずtrueにする
		.use(rehypeReact, {
			createElement,
			components: {
				a: CustomLink, // ←ここで、<a>を<CustomLink>に置き換えるよう設定
			},
		});
	return processor.processSync(res).result;
}

export const processor = unified()
	.use(rehypeParse, { fragment: true }) // fragmentは必ずtrueにする
	.use(rehypeReact, {
		createElement,
		components: {
			a: CustomLink, // ←ここで、<a>を<CustomLink>に置き換えるよう設定
		},
	});
