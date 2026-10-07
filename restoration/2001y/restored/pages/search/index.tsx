import Blog_post from "components/widget/blog_post";
import Works_post from "components/widget/WorksList_post";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useMatchMedia from "lib/useMatchMedia";
import { viewF } from "lib/viewF";
import c_works from "styles/works.module.scss";
import c_search from "styles/search.module.scss";
export default function Output({ res }) {
    const router = useRouter();
    const [results, setResults] = useState(res);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const isMobile = useMatchMedia(800);
    const workRows = viewF(results.works, isMobile ? 2 : 3.5);
    useEffect(() => {
        if (!router.isReady) return;
        let active = true;
        const value = Array.isArray(router.query.s) ? router.query.s[0] : router.query.s || "";
        const searchWord = String(value).replace(/[　,/]/g, " ").trim();
        if (!searchWord) { setResults({blog: [], works: []}); setLoading(false); return; }
        setLoading(true); setFailed(false);
        Promise.all([
            GETwpList("/posts?per_page=100&search=" + encodeURIComponent(searchWord)),
            GETwpList("/works?per_page=100&search=" + encodeURIComponent(searchWord)),
        ]).then(([blog, works]) => {
            if (active) setResults({blog, works});
        }).catch(() => { if (active) setFailed(true); })
          .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [router.isReady, router.query.s]);
    return (
        <>
            {loading && <p>読み込み中...</p>}
            {failed && <p role="alert">読み込めませんでした。再読み込みしてください。</p>}
            <h2>Blog</h2>
            <ul>
                {results.blog.map((e1) => (
                    <li key={e1.id || e1.slug}>
                        <Blog_post res={e1} />
                    </li>
                ))}
            </ul>
            <h2>Works</h2>
            <section className={c_works.wrap + " " + c_search.works} aria-label="Worksの検索結果">
                <div className={c_works.scroll}>
                    <ul className={c_works.list}>
                        {workRows.map(row => (
                            <li key={row[0].id || row[0].slug}>
                                <ul>{row.map(work => <Works_post key={work.id || work.slug} res={work} countSum={row.length} />)}</ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}

import { GETwpList } from "lib/fetch";
export async function getStaticProps() {
    return {
        props: {
            res: {
                blog: [],
                works: [],
            },
        },
    };
}
