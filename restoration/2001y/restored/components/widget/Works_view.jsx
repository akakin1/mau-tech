import Head from "components/Head";
import { restoreContentLink } from "lib/contentLinks";
import Link from "next/link";

import c_works from "styles/works.module.scss";

import { useCallback, useEffect, useMemo, useRef, useState, createElement } from "react";
import { segmentTitle } from "lib/segmentTitle.mjs";
import Router, { useRouter } from "next/router";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import classNames from "classnames";

import Carousel from "components/Carousel";

const CustomLink = ({ children, href }) => (
	<a href={restoreContentLink(href)} target="_blank" rel="noopener noreferrer">
		{children}
	</a>
);
const processor = unified()
	.use(rehypeParse, { fragment: true }) // fragmentは必ずtrueにする
	.use(rehypeReact, {
		createElement,
		components: {
			a: CustomLink, // ←ここで、<a>を<CustomLink>に置き換えるよう設定
		},
	});

function renderWorkTitle(title) {
	return segmentTitle(title || "").map((target) => {
		const key = `${target.index}:${target.segment}`;
		if (target.segment === "\n") return <br key={key} />;
		if (target.segment === " ") {
			return <span key={key} style={{ display: "inline" }}> </span>;
		}
		return <span key={key} style={{ display: "inline-block" }}>{target.segment}</span>;
	});
}

function renderContent(content) {
	if (!content) return null;
	try {
		return processor.processSync(content).result;
	} catch (error) {
		console.error("Works content rendering failed", error);
		return <p>本文を表示できませんでした。</p>;
	}
}

export default function Output({ res }) {
	const router = useRouter();
	// SSR時点でも本文を表示する。モバイルSafariでhydrationが遅延・失敗しても空画面にしない。
	let [state_open, set_state_open] = useState(true);
	const closeTimer = useRef(null);
	useEffect(() => () => {
		window.clearTimeout(closeTimer.current);
		closeTimer.current = null;
	}, [res.slug]);

	let dynamicRoutesName = router.pathname.split(/\[|\]/)[1];
	const queryParams = useMemo(() => {
		const params = { ...router.query };
		delete params[dynamicRoutesName];
		return params;
	}, [dynamicRoutesName, router.query]);

	const delayPushPage = useCallback((url) => {
		if (closeTimer.current !== null) return;
		set_state_open(false);
		router.prefetch(url);
		closeTimer.current = setTimeout(() => {
			Router.push(
				{
					pathname: url,
					query: {
						...queryParams,
					},
				},
				undefined,
				{
					shallow: true,
				}
			).catch(error => {
				if (!error.cancelled) { set_state_open(true); console.error("Works navigation failed", error); }
			}).finally(() => { closeTimer.current = null; });
		}, 0.3 * 1000);
	}, [queryParams, router]);

	const handleKeyUp = useCallback((event) => {
		if (event.key === 'Escape') {
			delayPushPage("/");
		}
	}, [delayPushPage]);

	useEffect(() => {
		set_state_open(true);
		document.addEventListener('keyup', handleKeyUp);
		return () => {
			document.removeEventListener('keyup', handleKeyUp);
		};
	}, [handleKeyUp]);

	return (
		<>
			<Head
				title={res.title && res.title + "｜2001Y's Works"}
				img={res.cfs.img}
			/>

			<dialog
				className={classNames(c_works.WorksOverlay, {
					[c_works.open]: state_open,
				})}
			open
			aria-label="作品詳細"
			aria-hidden={!state_open}
			style={{ opacity: state_open ? 1 : 0 }}
			onCancel={(e) => {
					e.preventDefault();
					delayPushPage("/");
				}}
			>
				<div className={c_works.main} style={{ transform: state_open ? "translateY(0)" : "translateY(100%)" }}>

					{res.cfs.embed && (
						<div className={classNames(c_works.tmbArea, c_works.modalWindow)}>
							<Carousel key={res.slug || res.id} className={classNames(c_works.tmb)} res={res.cfs.embed} imgSize={res.imgSize} />
						</div>
					)}

					<div className={classNames(c_works.mainArea, c_works.modalWindow)}>
						<article>
							<div className={c_works.meta}>
								{res.title && (
									<h2
										className={c_works.title}
									>{renderWorkTitle(res.title)}</h2>
								)}
								{res.tags && (
									<ul className={c_works.tagList}>
										{res.tags.map((e) => (
											<li key={e.slug || e.id || e.name}>#{e.name}</li>
										))}
									</ul>
								)}
								{res.cfs.time && <li>{res.cfs.time}</li>}
								{res.cfs.location && <li>{res.cfs.location}</li>}
							</div>
							{renderContent(res.content)}
						</article>

					</div>
					<footer>
						©︎ 2015-2023, 2001Y<br />
						引用や転載の際は当URLを掲載すること。
					</footer>
				</div>

				{/* Task: 関連記事 */}
				{/* {res.child && (
					<div
						className={classNames(c_works.relatedScrollBox, {
							[c_works.open]: state_open,
						})}
					>
						<ul>
							{res.child.map((e, i) => (
								<WorksList_post key={i} res={e} countSum={res.child.length} />
							))}
						</ul>
					</div>
				)} */}
			</dialog>

			{/* <div
				className={classNames(c_works.backButton)}
			>
				Back to Works
			</div> */}
		</>
	);
}
