import { useEffect, memo } from "react";
import Router, { useRouter } from "next/router";
import classNames from "classnames";
import Link from "next/link";

import WorksList_post from "components/widget/WorksList_post";
const WorksList_post_Memo = memo(WorksList_post);
import { viewF } from "lib/viewF.ts";

import c_V from "styles/_V.module.scss";
import c_works from "styles/works.module.scss";

import useMatchMedia from "lib/useMatchMedia"

export default function Output({ res, cat, lock }) {
	const router = useRouter();
	const params = router.query;
	let title = "2001Y's Works";

	// カテゴリフィルタ
	if (params.cat) {
		let rr = [];
		res.flat().filter((e) => {
			if (e.category) {
				e.category.map((e1) => {
					if (e1.slug == params.cat) {
						rr.push(e);
						title = "#" + e1.name + "｜2001Y's Works";
						return true;
					}
				});
			}
			return false;
		});
		res = rr;
	}

	res = viewF(res, 3.5);
	useMatchMedia(800) && (res = viewF(res, 2))

	const sessionName = "scrollSave";
	const readScrollPosition = () => {
		try {
			return sessionStorage.getItem(sessionName);
		} catch {
			return null;
		}
	};
	const saveScrollPosition = (value) => {
		try {
			sessionStorage.setItem(sessionName, value);
		} catch {
			// Private browsing or an embedded WebView may deny sessionStorage.
		}
	};
	useEffect(() => {
		let elm = document.querySelector("#wrap");
		if (!elm) return;
		// スクロール位置の復元
		const savedPosition = readScrollPosition();
		elm.scrollTop = savedPosition || 0;
	});
	useEffect(() => {
		let elm = document.querySelector("#wrap");
		const onRouteChangeStart = (url) => {
			// スクロール位置の保存
			url = new URL("http://example.com" + url);
			let now = router.pathname.split("/");
			let next = url.pathname.split("/");
			if (
				(now[1] == "" && next[1] == "works") ||
				(now[1] == "works" && next[1] == "")
			) {
				saveScrollPosition(elm.scrollTop);
			}
			if (now == next) {
				saveScrollPosition("0");
			}
		};
		// このpageを離れる直前に発火
		Router.events.on("routeChangeStart", onRouteChangeStart);
		return () => {
			Router.events.off("routeChangeStart", onRouteChangeStart);
		};
	}, [router.pathname]);

	// console.log(res)

	return (
		<>
			{/* カテゴリーリスト */}
			<ul className={c_works.catList} id="tagList">
				<li>
					<Link legacyBehavior href={"/"} shallow={true} scroll={true}>
						<a className={classNames(c_V.animeBG_font)}>all</a>
					</Link>
				</li>
				{cat.map((e) => (
					<li key={e.id || e.slug || e.name}>
						<Link legacyBehavior href={router.asPath.split("?")[0] + "?cat=" + e.slug} shallow={true} scroll={true}>
							<a className={classNames(c_V.animeBG_font)}>{e.name}</a>
						</Link>
						<ul className={classNames(c_works.subCatList, c_works.tagList)}>
							{e.tagList.map((e1) => (
								<li key={e1.id || e1.slug || e1.name}>{e1.name}</li>
							))}
						</ul>
					</li>
				))}
			</ul>

			{/* メイン */}
			<section
				className={classNames(c_works.wrap, { [c_works.lock]: lock })}
				id="wrap"
			>
				<div className={c_works.scroll} id="scroll">
					<ul className={c_works.list} id="box_">
						{res.map((e) => (
							<li key={e[0]?.id || e[0]?.slug || e[0]?.category || "works-group"}>
								<ul>
									{e.map((e1) => (
										<WorksList_post_Memo key={e1.id || e1.slug || e1.title} res={e1} countSum={e.length} />
									))}
								</ul>
							</li>
						))}
					</ul>
				</div>
			</section>
		</>
	);
}
// import { GETwpList } from "lib/fetch";
// import { md2html } from "lib/unified";
// export async function getStaticProps() {
// 	let res = await GETwpList("/works");
// 	let cat = await GETwpList("/works_cat");
// 	res.map(async (e, i) => {
// 		e.content = await md2html(e.content);
// 	});
// 	return {
// 		props: {
// 			res,
// 			cat,
// 		},
// 	};
// }
