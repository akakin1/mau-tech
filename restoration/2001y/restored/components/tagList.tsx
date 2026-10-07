import Head from "components/Head";
import Link from "next/link";
import Image from "next/image";
import classNames from "classnames";

import Blog_post from "components/widget/blog_post";
import { GETpostList } from "lib/fetch";
import { useState, useEffect, useRef } from "react";

// import localFont from 'next/font/local'
// const myFont = localFont({ src: './public/ia-writer-quattro/iAWriterQuattroS-Bold.woff2' })
import c_blog from "styles/blog.module.scss";
import c_Heading from "styles/heading.module.scss";
import c_V from "styles/_V.module.scss";

import { InView } from 'react-intersection-observer';

export default function Output({ res }) {
	// The first API page contains 18 records, but the original layout shows 12.
	// Re-read page 1 on demand and append its unseen records before page 2.
	const [state_pageNumber, setPageNumber] = useState(() => res.map(() => 0));
	const [state_nextPageList, setNextPageList] = useState(() => res.map(() => []));
	const [errors, setErrors] = useState({});
	const pending = useRef(new Set());
	const pages = useRef(res.map(() => 0));
	const seen = useRef(res.map(() => new Set(res.flatMap(group => group.postList.map(post => post.id)))));
	const generation = useRef(0);
	useEffect(() => {
		const counter = generation;
		generation.current++;
		pages.current = res.map(() => 0);
		seen.current = res.map(() => new Set(res.flatMap(group => group.postList.map(post => post.id))));
		pending.current.clear();
		setPageNumber(res.map(() => 0));
		setNextPageList(res.map(() => []));
		setErrors({});
		return () => { counter.current++; };
	}, [res]);

	let title = "2001Y's Blog";
	if (res[0].name != "Latest") {
		title = "tag:" + res[0].name + "｜" + title;
	}
	// const [ref, inView] = useInView({
	// 	rootMargin: '-100px 0px',
	// });

	async function nextPageBlogList(i, id) {
		if (pending.current.has(i) || pages.current[i] >= Number(res[i].totalpages)) return;
		pending.current.add(i);
		const currentGeneration = generation.current;
		const page = pages.current[i] + 1;
		try {
			const result = await GETpostList("&page=" + page + (id == "latest" ? "" : "&tags=" + id));
			if (generation.current !== currentGeneration) return;
			const posts = result.postList.filter(post => {
				if (seen.current[i].has(post.id)) return false;
				seen.current[i].add(post.id); return true;
			});
			pages.current[i] = page;
			setPageNumber([...pages.current]);
			setNextPageList(previous => previous.map((list, index) => index === i ? [...list, ...posts] : list));
			setErrors(previous => ({...previous, [i]: false}));
		} catch {
			if (generation.current === currentGeneration) setErrors(previous => ({...previous, [i]: true}));
		} finally {
			if (generation.current === currentGeneration) pending.current.delete(i);
		}
	}
	// console.log(res)
	return (
		<>
			<Head title={title} />
			<ol className={c_blog.postSection}>
				{res.map((e, i) => (
					<li key={e.id || e.slug || e.name} data-count={e.allCount}>
						<div className={classNames(c_blog.title)}>
							<div className={c_blog.title_inner}>
								<h2 className={classNames(c_Heading.h2, c_Heading.h2_tag)}>
									<Link legacyBehavior href={e.id === "latest" ? "/blog" : "/blog/tag/" + e.slug}>
										<a className={classNames(c_V.animeBG_font)}>#{e.name}</a>
									</Link>
								</h2>
								<ol className={classNames(c_blog.tagList, c_blog.hover)}>
									{e.tagList.map((e1) => (
										<li key={e1.id || e1.slug || e1.name}>
											<Link legacyBehavior href={"/blog/tag/" + e1.slug}>
												<a>
													#{e1.name}({e1.allCount})
												</a>
											</Link>
										</li>
									))}
									<li>etc.</li>
								</ol>
							</div>
						</div>
						<ul className={c_blog.postList}>
							{e.postList.map((e1) => (
								<li key={e1.id || e1.slug}>
									<Blog_post res={e1} />
								</li>
							))}
							{state_nextPageList[i].map((e1) => (
								<li key={e1.id || e1.slug}>
									<Blog_post res={e1} />
								</li>
							))}
							{(state_pageNumber[i] < Number(e.totalpages)) &&
								<InView key={String(e.id) + ":" + state_pageNumber[i]} as="li" onChange={(inView) => { if (inView && !errors[i]) nextPageBlogList(i, e.id); }}>
									{errors[i] ? <button type="button" onClick={() => nextPageBlogList(i, e.id)}>再読み込み</button> : "読み込み中..."}
								</InView>
							}
						</ul>
					</li>
				))}
			</ol>
		</>
	);
}
