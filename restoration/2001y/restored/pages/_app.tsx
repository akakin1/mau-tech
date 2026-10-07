import "the-new-css-reset/css/reset.css";
import "../styles/variable.scss";
import "../styles/globals.scss";
import "../styles/prism.css"
// import Head from "components/Head";
import Header from "components/header";
import { GoogleAnalytics } from "@next/third-parties/google";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fallbackFor } from "lib/mediaFallback";

import LoadAVG from "public/load.svg";

const isWorksPath = (path = "") =>
	path === "/" || path === "/works" || path.startsWith("/works/");

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const [pageLoading, setPageLoading] = useState(false);
	useEffect(() => {
		function repairImage(event) {
			const image = event.target;
			if (!(image instanceof HTMLImageElement)) return;
			const source = image.currentSrc || image.src;
			const fallback = fallbackFor(source);
			if (fallback && source !== fallback && image.dataset.restoredMedia !== source) {
				image.dataset.restoredMedia = source;
				image.closest("picture")?.querySelectorAll("source").forEach(source => source.removeAttribute("srcset"));
				image.removeAttribute("srcset");
				image.src = fallback;
			}
		}
		document.addEventListener("error", repairImage, true);
		for (const image of Array.from(document.images)) {
			if (image.complete && !image.naturalWidth) repairImage({target:image});
		}
		return () => document.removeEventListener("error", repairImage, true);
	}, [router.asPath]);
	useEffect(() => {
		const handleStart = (url) => {
			let load = true;
			url = new URL("http://example.com" + url);
			const currentPath = router.asPath.split("?")[0];
			// Works pages have their own overlay transition; never hide their content
			// behind the global loading layer during dynamic-route hydration.
			if (
				url.pathname == currentPath ||
				isWorksPath(currentPath) ||
				isWorksPath(url.pathname)
			) {
				load = false;
			}
			setPageLoading(load)
		};
		const handleComplete = () => setPageLoading(false);
		router.events.on("routeChangeStart", handleStart);
		router.events.on("routeChangeComplete", handleComplete);
		router.events.on("routeChangeError", handleComplete);
		return () => {
			router.events.off("routeChangeStart", handleStart);
			router.events.off("routeChangeComplete", handleComplete);
			router.events.off("routeChangeError", handleComplete);
		};
	});
	var nowTime = new Date();
	var Y = nowTime.getFullYear();

	useEffect(() => {
		const supportsDynamicViewport =
			typeof CSS !== "undefined" &&
			typeof CSS.supports === "function" &&
			CSS.supports("(height: 100dvh)");
		if (!supportsDynamicViewport) {
			handleResize();
			window.addEventListener('resize', handleResize)
			return () => {
				window.removeEventListener('resize', handleResize)
			}
		}
		function handleResize() {
			let vh = window.innerHeight;
			document.documentElement.style.setProperty('--100vh', `${vh}px`);
		}
	}, []);
	const isWorksPage =
		isWorksPath(router.asPath.split("?")[0]) || isWorksPath(router.pathname);
	const visiblePageLoading = pageLoading && !isWorksPage;

	return (
		<>
			<GoogleAnalytics gaId="G-51E14JSXC0" />
			<Header />
			<main
				className={String(visiblePageLoading)}
				style={isWorksPage ? { opacity: 1 } : undefined}
			>
				<Component {...pageProps} />
			</main>
			<div className={String("loading " + visiblePageLoading)}>
				<LoadAVG className="load" />
			</div>
		</>
	);
}
