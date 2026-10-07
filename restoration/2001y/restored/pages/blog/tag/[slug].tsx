import Head from "components/Head";
import TagListRender from "components/tagList";
export default function Output({ res }) {
    return (
        <>
            <Head title={"2001Y's Blog"} />
            <TagListRender res={res} />

        </>
    );
}

import { tag, tagList } from "lib/fetch";
import liveTags from "content/live-tags.json";
export async function getStaticProps({ params }) {
    const captured = liveTags[decodeURIComponent(params.slug)];
    if (captured) return { props: captured };
    //パラメタに含まれたidのタグリストを取得
    var post = await tag(params.slug);

    // 子タグの昇格
    var cards = post.tagList.slice(0, 2).map((e, i) => {
        return tag(e.slug);
    });
    var a = await Promise.all(cards);

    var res = [post, ...a];

    // 記事データをprops経由でページに渡します。
    return {
        props: {
            res: await tagList(res)
        }
    };
}

import { GETwpList } from "lib/fetch";
export async function getStaticPaths() {
    // 外部APIエンドポイントを呼び出して記事を取得します。
    let res = await GETwpList("/tags?per_page=100&orderby=count&order=desc&_fields=slug")
    res = res.map(e => decodeURI(e.slug))

    // 記事に基づいてプリレンダリングしたいパスを取得します
    var paths = res.map((slug) => ({
        params: { slug },
    }));

    // ビルド時にこれらのパスだけをプリレンダリングします。
    // { fallback: false } は他のルートが404になることを意味します。
    return { paths, fallback: false };
}
