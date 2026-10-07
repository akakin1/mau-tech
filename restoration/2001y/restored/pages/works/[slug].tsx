import Head from "components/Head";
import WorksList from "components/widget/WorksList"
import Works_view from "components/widget/Works_view";
import { getWorkAssets, getWorkEmbeds, localizeWorkContent } from "lib/workAssets";
import { useRouter } from 'next/router'
import { segmentTitle } from "lib/segmentTitle.mjs";

export default function Output({ res, selectedWork, cat }) {
   const router = useRouter();
   let params = router.query;

   let title = "2001Y's Works";
   return (
      <>
         <Head title={title} />

         {/* 個別ページ */}
         <Works_view res={selectedWork} />

         {/* メイン */}
         <WorksList cat={cat} res={res} lock={false} />
      </>
   );
}

import { GETwpList } from "lib/fetch";
import liveWorks from "content/live-works.json";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from 'remark-gfm'
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrism from '@mapbox/rehype-prism';
import rehypeSlug from 'rehype-slug'

export async function getStaticProps({ params }) {
	const captured = liveWorks[decodeURIComponent(params.slug)];
	if (captured) return {props:captured};
	let [res, cat] = await Promise.all([
		GETwpList("/works"),
		GETwpList("/works_cat"),
	]);
   await Promise.all(res.map(async (e, i) => {
      if (e.slug == params.slug) {

         // 本文
         let result = await unified()
            // Markdown → HTML
            .use(remarkParse)
            .use(remarkGfm) //表対応
            .use(remarkRehype, {
               allowDangerousHtml: true // <html>など
            })
            .use(rehypeSlug) //見出しにid
            .use(rehypePrism, {
               ignoreMissing: true,  // 存在しない言語名を書いていた時に無視する
            })
            .use(rehypeStringify, { allowDangerousHtml: true })
            .process(e.content);
         e.content = String(result);

         // タイトル
         let title = e.title;
         const segments = segmentTitle(title);
         title = Array.from(segments).map((target) => {
            if (target.segment == '\n') {
               return '<br>';
            } else if (target.segment == ' ') {
               return '<span style="display: inline"> </span>';
            } else {
               return `<span style="display: inline-block">${target.segment}</span>`;
            }
         }).join('');
         e.title_html = title;

         const localAssets = getWorkAssets(e.slug);
         if (localAssets?.cover) e.cfs.img = localAssets.cover;
         e.content = localizeWorkContent(e.slug, e.content);

         // 公開ページではFigmaの一時書き出しURLを取得しない。
         // 永続URLの素材が未同期なら、WordPressの表紙を明示的に表示する。
         e.cfs.embed = getWorkEmbeds(e.slug, e.cfs);
      } else {
         e.content = "";
      }
   }));

   const selectedWork = res.find((e) => encodeURI(decodeURI(e.slug)) == encodeURI(String(params.slug)));

   return {
      props: {
         res,
         selectedWork,
         cat,
      },
   };
}

export async function getStaticPaths() {
   // 外部APIエンドポイントを呼び出して記事を取得します。
   let res = await GETwpList("/works?per_page=100");
   res = res.map((e) => decodeURI(e.slug));

   // 記事に基づいてプリレンダリングしたいパスを取得します
   var paths = res.map((slug) => ({
      params: { slug },
   }));

   // ビルド時にこれらのパスだけをプリレンダリングします。
   // { fallback: false } は他のルートが404になることを意味します。
   return { paths, fallback: false };
}
