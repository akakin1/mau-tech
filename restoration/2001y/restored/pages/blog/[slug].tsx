import Head from "components/Head";
import Link from "next/link";
// import Image from "next/image";
import classNames from "classnames";

import CustomH2 from "components/unified/CustomH2"
import css_CutomH2 from "components/unified/CutomH2.module.scss"
import AdSence from "components/AdSence/AdSence"
import { restoreContentLink } from "lib/contentLinks";
import { restoreImages } from "lib/restoreImages";

import c_Heading from "styles/heading.module.scss";
import c_blog from "styles/blog.module.scss";
import c_Post from "styles/post.module.scss";

const CustomLink = ({ children, href }) => (
	<a href={restoreContentLink(href)} target="_blank" rel="noopener noreferrer">
		{children}
	</a>
);
const processor = unified()
	.use(rehypeParse, { fragment: true })
	.use(rehypeReact, {
		createElement,
		components: {
			a: CustomLink,
			h2: CustomH2
		},
	});

export default function Output({ res, content }) {
	return (
		<>
			<Head
				title={res.title && res.title + "｜2001Y's Blog"}
			// url={}
			/>
			<div className={c_Post.meta}>
				<div className={c_Post.metaData}>
					<time content="Published">{res.date}</time>
					{res.date !== res.modified && (
						<time content="Modified">{res.modified}</time>
					)}
				</div>
				<h1 className={classNames(c_Post.h1, c_Heading.h1, c_Heading.h1_tag)}>{res.title}</h1>
				<ul className={classNames(c_blog.tagList, c_blog.hover)}>
					{res.tags.map((e) => (
						<li key={e.slug || e.id || e.name}>
							<Link legacyBehavior href={"/blog/tag/" + e.slug}>
								<a>#{e.name}</a>
							</Link>
						</li>
					))}
				</ul>
			</div>
			<article className={c_Post.article}>
				{processor.processSync(res.content).result}
				<div className={css_CutomH2.adsence}>
					<AdSence />
				</div>
			</article>
		</>
	);
}

import { GETpost } from "lib/fetch";
import livePosts from "content/live-posts.json";
import { restorePreExamples } from "lib/restorePreExamples";

import { createElement } from "react";
import { unified } from "unified"; //Markdown を HTML へと変換するために必要な最低限
import remarkParse from "remark-parse"; //Markdown を HTML へと変換するために必要な最低限
import remarkGfm from 'remark-gfm'
import remarkRehype from "remark-rehype"; //Markdown を HTML へと変換するために必要な最低限
import rehypeStringify from "rehype-stringify"; //Markdown を HTML へと変換するために必要な最低限
import rehypePrism from '@mapbox/rehype-prism';
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import { decodeBody } from 'lib/decodeBody';
import remarkBreaks from "remark-breaks";
import remarkUnwrapImages from 'remark-unwrap-images'

// 画像が連続している場合にdivで囲む関数
function wrapImages() {
	return function (tree: any) {
		let images = []
		for (let i = 0; i < tree.children.length; i++) {
			let node = tree.children[i]
			if (node.type === 'image') {
				// 画像ノードなら配列に追加
				images.push(node)
			} else {
				// 画像ノード以外なら配列をリセット
				images = []
			}
			if (images.length > 1) {
				// 画像ノードが2つ以上連続している場合
				if (i === tree.children.length - 1 || tree.children[i + 1].type !== 'image') {
					// 最後のノードか次のノードが画像ノードでない場合
					// divノードを作成して画像ノードを子要素にする
					let div = {
						type: 'element',
						tagName: 'div',
						properties: {},
						children: images,
					}
					// 配列の先頭の位置にdivノードを挿入
					let index = i - images.length + 1
					tree.children.splice(index, images.length, div)
					// 配列をリセット
					images = []
				}
			}
		}
	}
}
export async function getStaticProps({ params }) {
	let res = await GETpost(params.slug);
	const captured = livePosts[decodeURIComponent(params.slug)];
	if (captured) return {props:{res:{...captured,content:restoreImages(restorePreExamples(captured.content,res.content))}}};
	let content = await unified()
		// Markdown → HTML
		.use(remarkParse)
		.use(remarkUnwrapImages)
		.use(remarkGfm) //表対応
		.use(remarkBreaks)
		.use(remarkRehype, {
			allowDangerousHtml: true // <html>など
		})
		.use(rehypeSlug) //見出しにid
		// .use(rehypeAutolinkHeadings, {
		// 	// behavior: "wrap"
		// })
		.use(rehypePrism, {
			ignoreMissing: true  // 存在しない言語名を書いていた時に無視する
		})
		.use(rehypeStringify, {
			allowDangerousHtml: true,
			// closeSelfClosing: true,
		})
		.process(
			decodeBody(res.content)
		);
	res.content = restoreImages(String(content));
	return {
		props: {
			res,
		},
	};
}

import { GETwpList } from "lib/fetch";
export async function getStaticPaths() {
	// 外部APIエンドポイントを呼び出して記事を取得します。
	let res = await GETwpList("/posts?per_page=100&_fields=slug");
	res = res.map((e) => decodeURI(e.slug));

	// 記事に基づいてプリレンダリングしたいパスを取得します
	var paths = res.map((slug) => ({
		params: { slug },
	}));

	// ビルド時にこれらのパスだけをプリレンダリングします。
	// { fallback: false } は他のルートが404になることを意味します。
	return { paths, fallback: false };
}
