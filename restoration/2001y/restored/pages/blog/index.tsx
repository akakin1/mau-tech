import TagListRender from "components/tagList";


import css from "styles/blog.module.scss"
export default function Output({ res, totalpages }) {
    return (
        <>
            <TagListRender res={res} />
        </>
    );
}

import { tagTop } from "lib/fetch";
import liveBlog from "content/live-blog.json";
export async function getStaticProps() {
    if (liveBlog.res) return { props: liveBlog };
    let res = await tagTop();
    // console.log(res)
    return {
        props: {
            res: [res[3], res[0], res[1], res[2]]
        }
    };
}
