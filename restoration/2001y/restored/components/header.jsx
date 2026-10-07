import Link from "next/link";
import Image from "next/image";
import classNames from "classnames";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import c_V from "styles/_V.module.scss";

import c_header from "styles/header.module.scss";

import useMatchMedia from "lib/useMatchMedia"
import AdSence from "components/AdSence/AdSence"

function handleKeyboardActivation(event, action) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		action();
	}
}

export default function Output() {
	let [profile, setProfile] = useState(true);
	let [state_menu, set_state_menu] = useState(true);
	let [darkmode, setDarkmode] = useState(false);

	let router = useRouter();
	const isMobile = useMatchMedia(800);
	const toggleDarkmode = useCallback((nextValue) => {
		setDarkmode((currentValue) => typeof nextValue === "boolean" ? nextValue : !currentValue);
	}, []);
	useEffect(() => {
		window.document.documentElement.setAttribute("data-darkmode", String(darkmode));
	}, [darkmode]);
	useEffect(() => {
		// OSダークモード反映
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			var darkmodeTimeout = window.setTimeout(() => toggleDarkmode(true), 500);
		}

		// グラデアニメーション
		const body = document.querySelector("body");
		const pointCount = 3;
		const colorRange = 100;

		let count = 0;
		let lastTimestamp = 0;

		let animationFrame;
		function animate(timestamp) {
			// 前回の処理から0.5秒以上経過していた場合に処理を実行する
			if (timestamp - lastTimestamp >= 100) {
				count = (count + 1) % 360;
				color(count);
				lastTimestamp = timestamp;
			}
			animationFrame = requestAnimationFrame(animate);
		}
		animationFrame = requestAnimationFrame(animate);


		function color(e) {
			for (let i = 0; i < pointCount; i++) {
				const h = Math.floor((e + (colorRange / pointCount) * i) % 360);
				body.style.setProperty(`--gradient_${i}`, `hsl(${h}, 100%, 70%)`);
			}
		}

		// subMenuを自動的に閉じる
		const menuTimeout = window.setTimeout(() => {
			set_state_menu(false);
			setProfile(false);
		}, 2000);
		return () => {
			window.clearTimeout(darkmodeTimeout);
			window.clearTimeout(menuTimeout);
			window.cancelAnimationFrame(animationFrame);
		};
	}, [toggleDarkmode]);

	let [search, setSearch] = useState(false);
	const submitSearch = (event) => {
		event.preventDefault();
		const input = event.currentTarget.elements.namedItem("s");
		const value = input.value.trim();
		if (!value) return;
		input.blur();
		setSearch(false);
		set_state_menu(false);
		router.push({ pathname: "/search", query: { s: value } });
	};
	useEffect(() => {
		if (!search || !isMobile || !window.visualViewport) return;
		const viewport = window.visualViewport;
		const update = () => document.documentElement.style.setProperty(
			"--search-keyboard-offset",
			Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) + "px",
		);
		update();
		viewport.addEventListener("resize", update);
		viewport.addEventListener("scroll", update);
		return () => {
			viewport.removeEventListener("resize", update);
			viewport.removeEventListener("scroll", update);
			document.documentElement.style.removeProperty("--search-keyboard-offset");
		};
	}, [search, isMobile]);
	let [pageName, setPageName] = useState(router.pathname);

	let nowPath = pageName.split("/")[1];
	if (!nowPath) {
		nowPath = "index";
	}
	return (
		<>
			<header className={c_header.header}>
				<section className={classNames(c_header.fixed)}>
					<section>
						<div
							className={classNames(c_header.headerTitle, c_header.border)}
						>
							<button
								type="button"
								aria-label="プロフィールメニューを開閉"
								onClick={() => setProfile(!profile)}
								onKeyDown={(event) => handleKeyboardActivation(event, () => setProfile(!profile))}
							>
							<div className={classNames(c_V.animeBG, c_header.profileIMGwrap)}>
								<div className={c_header.profileIMG}>
									<Image
										src="https://github.com/2001y.png"
										width={50}
										height={50}
										alt="2001Yのプロフォール画像"
									/>
								</div>
							</div>
							<h1>
								2001Y<span>@Y20010920T</span>
							</h1>
							</button>
							<div className={c_header.subMenu}>
								<ul className={classNames({ [c_header.subMenu_open]: profile })}>
									{[
										["Twitter", "https://twitter.com/y20010920t", "#twitter"],
										[
											"Instagram",
											"https://www.instagram.com/y20010920t",
											"#instagram",
										],
										[
											"Facebook",
											"https://www.facebook.com/Yoshiki.Tam",
											"#facebook",
										],
									].map((e) => (
														<li key={e[1]}>
												<Link legacyBehavior href={e[1]}>
													<a
														href={e[1]}
														aria-label={e[0]}
														target="_blank"
														onClick={() => setPageName(e[1])}
														className={classNames(
															c_header.icon,
															c_V.animeBG_after
														)}
														style={{ "--icon": "url(" + e[2] + ")" }}
													></a>
												</Link>
											</li>

									))}
								</ul>
							</div>
						</div>
					</section>
					<section>
						<nav className={classNames(c_header.menu, c_header.border, nowPath)}>
							<ul
								className={classNames(c_V.animeBG_after, c_header.border_after)}
							>
								{[
									["Works", "/"],
									["Blog", "/blog"],
									["About", "/about"],
								].map((e) => (
													<li key={e[1]}>
											<Link legacyBehavior href={e[1]}>
												<a href={e[1]} onClick={() => setPageName(e[1])}>{e[0]}</a>
											</Link>
										</li>

								))}
							</ul>
						</nav>
					</section>
					<section>
						<button
							type="button"
							className={classNames(
								c_header.iconBtn,
								c_header.spMenu,
								c_header.border
							)}
							aria-label="メニューを開閉"
							style={{ "--icon": "url(#menu)" }}
							onClick={() => { set_state_menu(!state_menu); setSearch(false); }}
						></button>
						<div className={classNames({ [c_header.subMenu]: isMobile })}>
							<ul
								className={classNames(c_header.setting, {
									[c_header.subMenu_open]: state_menu,
								})}
							>
								<li
									className={classNames(c_header.searchWrap, {
										[c_header.searchWrap_true]: search,
									})}
								>
									{!isMobile && <form onSubmit={submitSearch}>
										<input name="s" required type="search" placeholder="検索" aria-label="検索" defaultValue={router.query.s || ""} />
									</form>}
									<button
										type="button"
										className={classNames(
											c_header.iconBtn,
											c_V.animeBG_after,
											{ [c_header.search_true]: search },
											c_header.border
										)}
										aria-label="検索を開閉"
										style={{ "--icon": "url(#search)" }}
										onClick={() => setSearch(!search)}
										></button>
								</li>
								<li>
									<button
										type="button"
										className={classNames(
											c_header.iconBtn,
											c_V.animeBG_after,
											{ [c_header.darkmode_true]: darkmode },
											c_header.border
										)}
										aria-label="ダークモードを切り替え"
										style={{ "--icon": "url(#darkmode)" }}
										onClick={() => toggleDarkmode()}
										></button>
								</li>
							</ul>
						</div>
					</section>
				</section>
				{isMobile && search && (
					<form className={c_header.mobileSearch} role="search" onSubmit={submitSearch}>
						<input name="s" required autoFocus type="search" enterKeyHint="search" placeholder="検索" aria-label="検索"
							defaultValue={router.query.s || ""} onKeyDown={event => { if (event.key === "Escape") setSearch(false); }} />
						<button type="submit" aria-label="検索を実行" className={classNames(c_header.iconBtn, c_V.animeBG_after)} style={{ "--icon": "url(#search)" }} />
					</form>
				)}
				{/* <section className={String(voting)}>
				<h2>GOOD & BAD</h2>
			</section> */}

				<button
					type="button"
					className={classNames(
						c_V.animeBG,
						c_header.filter,
						c_header.iconBtn,
						nowPath
						)}
					aria-label="表示フィルターを切り替え"
					style={{ "--icon": "url(#filter)" }}
					onClick={() => toggleDarkmode()}
				></button>

				<svg style={{ position: "fixed" }}>
					<clipPath id="darkmode" clipPathUnits="objectBoundingBox">
						<path
							transform={"scale(" + 1 / 16 + "," + 1 / 16 + ")"}
							d="M7.98 7.83C7.46 7.3 7.03 6.71 6.69 6.08C6.37 5.44 6.14 4.78 6.01 4.09C5.88 3.41 5.85 2.72 5.93 2.02C5.99 1.33 6.16 0.66 6.43 0C5.68 0.15 4.96 0.41 4.26 0.77C3.56 1.13 2.92 1.6 2.34 2.19C1.56 2.97 0.98 3.85 0.6 4.82C0.2 5.81 0 6.81 0 7.83C0 8.86 0.2 9.85 0.6 10.83C0.98 11.81 1.56 12.69 2.34 13.46C3.12 14.25 4 14.83 4.97 15.22C5.96 15.61 6.96 15.8 7.98 15.8C9.01 15.8 10.01 15.61 10.99 15.22C11.97 14.83 12.84 14.25 13.63 13.46C14.2 12.89 14.67 12.25 15.04 11.55C15.41 10.86 15.66 10.13 15.8 9.39C15.15 9.66 14.48 9.83 13.78 9.89C13.08 9.97 12.39 9.94 11.71 9.81C11.03 9.68 10.38 9.45 9.74 9.12C9.09 8.79 8.51 8.36 7.98 7.83Z"
						/>
					</clipPath>
					<clipPath id="search" clipPathUnits="objectBoundingBox">
						<path
							transform={"scale(" + 1 / 17 + "," + 1 / 17 + ")"}
							d="M10.35 10.36C11.21 9.49 11.64 8.45 11.64 7.24C11.64 6.03 11.21 4.99 10.35 4.13C9.49 3.27 8.45 2.84 7.24 2.84C6.03 2.84 4.99 3.27 4.13 4.13C3.27 4.99 2.84 6.03 2.84 7.24C2.84 8.45 3.27 9.49 4.13 10.35C4.99 11.21 6.03 11.64 7.24 11.64C8.45 11.64 9.49 11.22 10.35 10.36ZM16.67 15.42C16.67 15.76 16.55 16.05 16.3 16.3C16.05 16.55 15.76 16.67 15.42 16.67C15.06 16.67 14.77 16.55 14.53 16.3L11.16 12.94C9.99 13.75 8.68 14.16 7.24 14.16C6.31 14.16 5.41 13.98 4.56 13.61C3.7 13.25 2.96 12.76 2.34 12.14C1.73 11.52 1.23 10.78 0.87 9.93C0.51 9.07 0.33 8.18 0.33 7.24C0.33 6.31 0.51 5.41 0.87 4.56C1.23 3.7 1.73 2.96 2.34 2.34C2.96 1.73 3.7 1.23 4.56 0.87C5.41 0.51 6.31 0.33 7.24 0.33C8.18 0.33 9.07 0.51 9.93 0.87C10.78 1.23 11.52 1.73 12.14 2.34C12.76 2.96 13.25 3.7 13.61 4.56C13.98 5.41 14.16 6.31 14.16 7.24C14.16 8.68 13.75 9.99 12.94 11.16L16.31 14.53C16.55 14.77 16.67 15.07 16.67 15.42Z"
						/>
					</clipPath>
					<clipPath id="twitter" clipPathUnits="objectBoundingBox">
						<path
							transform={"scale(" + 1 / 15 + "," + 1 / 15 + ")"}
							d="M13.46 4.99C13.46 5.06 13.46 5.13 13.46 5.19C13.46 5.26 13.46 5.33 13.46 5.4C13.46 6.39 13.27 7.4 12.89 8.42C12.51 9.44 11.95 10.37 11.21 11.19C10.47 12.02 9.56 12.69 8.47 13.21C7.39 13.74 6.14 14 4.72 14C3.85 14 3.02 13.88 2.22 13.64C1.42 13.4 0.68 13.06 0 12.63C0.13 12.65 0.26 12.66 0.38 12.66C0.49 12.66 0.62 12.66 0.75 12.66C1.47 12.66 2.15 12.55 2.8 12.33C3.45 12.11 4.03 11.79 4.56 11.38C3.89 11.37 3.3 11.16 2.77 10.77C2.25 10.38 1.88 9.88 1.68 9.28C1.78 9.3 1.87 9.31 1.98 9.32C2.08 9.33 2.18 9.34 2.27 9.34C2.41 9.34 2.55 9.33 2.68 9.3C2.81 9.28 2.94 9.26 3.08 9.23C2.37 9.09 1.78 8.74 1.31 8.19C0.84 7.64 0.61 7 0.61 6.26V6.22C0.82 6.33 1.05 6.42 1.28 6.49C1.51 6.56 1.75 6.6 2 6.61C1.59 6.34 1.25 5.98 1 5.54C0.75 5.09 0.63 4.61 0.63 4.09C0.63 3.81 0.66 3.54 0.74 3.28C0.82 3.03 0.92 2.79 1.05 2.56C1.44 3.02 1.86 3.44 2.32 3.81C2.79 4.19 3.29 4.51 3.83 4.78C4.36 5.05 4.93 5.27 5.54 5.43C6.14 5.6 6.75 5.7 7.38 5.73C7.36 5.61 7.34 5.5 7.33 5.38C7.32 5.26 7.31 5.14 7.31 5.03C7.31 4.19 7.61 3.48 8.21 2.89C8.8 2.3 9.53 2 10.39 2C10.83 2 11.24 2.09 11.63 2.26C12.02 2.44 12.35 2.67 12.62 2.97C12.98 2.9 13.32 2.8 13.65 2.68C13.98 2.55 14.29 2.4 14.57 2.23C14.46 2.58 14.29 2.9 14.06 3.19C13.83 3.48 13.55 3.71 13.23 3.9C13.54 3.87 13.84 3.81 14.14 3.72C14.44 3.64 14.73 3.54 15 3.43C14.79 3.73 14.55 4.01 14.29 4.28C14.04 4.54 13.76 4.78 13.46 4.99Z"
						/>
					</clipPath>
					<clipPath id="instagram" clipPathUnits="objectBoundingBox">
						<path
							transform={"scale(" + 1 / 15 + "," + 1 / 15 + ")"}
							d="M9.27 9.27C9.76 8.78 10 8.19 10 7.5C10 6.81 9.76 6.22 9.27 5.73C8.78 5.24 8.19 5 7.5 5C6.81 5 6.22 5.24 5.73 5.73C5.24 6.22 5 6.81 5 7.5C5 8.19 5.24 8.78 5.73 9.27C6.22 9.76 6.81 10 7.5 10C8.19 10 8.78 9.76 9.27 9.27ZM10.22 4.78C10.97 5.52 11.35 6.43 11.35 7.5C11.35 8.57 10.97 9.48 10.22 10.22C9.48 10.97 8.57 11.35 7.5 11.35C6.43 11.35 5.52 10.97 4.78 10.22C4.03 9.48 3.65 8.57 3.65 7.5C3.65 6.43 4.03 5.52 4.78 4.78C5.52 4.03 6.43 3.65 7.5 3.65C8.57 3.65 9.48 4.03 10.22 4.78ZM12.14 2.86C12.31 3.04 12.4 3.25 12.4 3.5C12.4 3.74 12.31 3.96 12.14 4.13C11.96 4.31 11.75 4.39 11.5 4.39C11.26 4.39 11.05 4.31 10.87 4.13C10.69 3.96 10.61 3.74 10.61 3.5C10.61 3.25 10.69 3.04 10.87 2.86C11.05 2.69 11.26 2.6 11.5 2.6C11.75 2.6 11.96 2.69 12.14 2.86ZM8.24 1.35C7.79 1.35 7.55 1.35 7.5 1.35C7.45 1.35 7.21 1.35 6.75 1.34C6.3 1.34 5.96 1.34 5.72 1.34C5.49 1.35 5.17 1.36 4.78 1.37C4.39 1.39 4.05 1.42 3.77 1.47C3.5 1.52 3.27 1.58 3.08 1.65C2.75 1.78 2.46 1.97 2.22 2.22C1.97 2.46 1.78 2.75 1.65 3.08C1.58 3.26 1.52 3.5 1.47 3.77C1.42 4.05 1.39 4.39 1.37 4.78C1.36 5.17 1.35 5.49 1.34 5.72C1.34 5.96 1.34 6.3 1.34 6.75C1.35 7.21 1.35 7.45 1.35 7.5C1.35 7.55 1.35 7.79 1.34 8.25C1.34 8.7 1.34 9.04 1.34 9.28C1.35 9.51 1.36 9.83 1.37 10.22C1.39 10.61 1.42 10.95 1.47 11.23C1.52 11.5 1.58 11.74 1.65 11.92C1.78 12.25 1.97 12.54 2.22 12.78C2.46 13.03 2.75 13.22 3.08 13.35C3.27 13.42 3.5 13.48 3.77 13.53C4.05 13.58 4.39 13.61 4.78 13.63C5.17 13.64 5.49 13.65 5.72 13.66C5.96 13.66 6.3 13.66 6.75 13.66C7.21 13.65 7.45 13.65 7.5 13.65C7.55 13.65 7.79 13.65 8.25 13.66C8.7 13.66 9.04 13.66 9.28 13.66C9.51 13.65 9.83 13.64 10.22 13.63C10.61 13.61 10.95 13.58 11.23 13.53C11.5 13.48 11.74 13.42 11.92 13.35C12.25 13.22 12.54 13.03 12.78 12.78C13.03 12.54 13.22 12.25 13.35 11.92C13.42 11.74 13.48 11.5 13.53 11.23C13.58 10.95 13.61 10.61 13.63 10.22C13.64 9.83 13.65 9.51 13.66 9.28C13.66 9.04 13.66 8.7 13.66 8.25C13.65 7.79 13.65 7.55 13.65 7.5C13.65 7.45 13.65 7.21 13.66 6.75C13.66 6.3 13.66 5.96 13.66 5.72C13.65 5.49 13.64 5.17 13.63 4.78C13.61 4.39 13.58 4.05 13.53 3.77C13.48 3.5 13.42 3.26 13.35 3.08C13.22 2.75 13.03 2.46 12.78 2.22C12.54 1.97 12.25 1.78 11.92 1.65C11.74 1.58 11.5 1.52 11.23 1.47C10.95 1.42 10.61 1.39 10.22 1.37C9.83 1.36 9.51 1.35 9.28 1.34C9.04 1.34 8.7 1.34 8.24 1.35ZM14.95 4.4C14.98 4.98 15 6.01 15 7.5C15 8.99 14.98 10.02 14.95 10.6C14.89 11.95 14.48 13 13.74 13.74C13 14.48 11.95 14.89 10.6 14.95C10.02 14.98 8.99 15 7.5 15C6.01 15 4.98 14.98 4.4 14.95C3.05 14.89 2 14.48 1.26 13.74C0.52 13 0.11 11.95 0.05 10.6C0.02 10.02 0 8.99 0 7.5C0 6.01 0.02 4.98 0.05 4.4C0.11 3.05 0.52 2 1.26 1.26C2 0.52 3.05 0.11 4.4 0.05C4.98 0.02 6.01 0 7.5 0C8.99 0 10.02 0.02 10.6 0.05C11.95 0.11 13 0.52 13.74 1.26C14.48 2 14.89 3.05 14.95 4.4Z"
						/>
					</clipPath>
					<clipPath id="facebook" clipPathUnits="objectBoundingBox">
						<path
							transform={"scale(" + 1 / 14 + "," + 1 / 14 + ")"}
							d="M11.38 0C12.1 0 12.72 0.26 13.23 0.77C13.74 1.28 14 1.9 14 2.63V11.38C14 12.1 13.74 12.72 13.23 13.23C12.72 13.74 12.1 14 11.38 14H9.66V8.58H11.48L11.75 6.46H9.66V5.11C9.66 4.77 9.73 4.52 9.88 4.35C10.02 4.18 10.3 4.09 10.71 4.09L11.82 4.08V2.2C11.44 2.14 10.9 2.11 10.2 2.11C9.37 2.11 8.71 2.36 8.22 2.84C7.72 3.33 7.47 4.02 7.47 4.9V6.46H5.65V8.58H7.47V14H2.63C1.9 14 1.28 13.74 0.77 13.23C0.26 12.72 7.63e-5 12.1 7.63e-5 11.38V2.63C7.63e-5 1.9 0.26 1.28 0.77 0.77C1.28 0.26 1.9 0 2.63 0H11.38Z"
						/>
					</clipPath>
					<clipPath id="filter" clipPathUnits="objectBoundingBox">
						<path
							transform={"scale(" + 1 / 16 + "," + 1 / 16 + ")"}
							d="M16 3.32C16 3.75 15.86 4.08 15.57 4.32L9.48 10.52V15.24V15.32C9.48 15.77 9.26 16 8.82 16C8.74 16 8.62 15.97 8.47 15.92L8.43 15.88L6.87 14.96C6.63 14.83 6.52 14.63 6.52 14.36V10.52L0.47 4.36C0.16 4.12 0 3.77 0 3.32C0 2.95 0.13 2.63 0.39 2.38C0.65 2.13 0.95 2 1.29 2H1.37H14.75C15.12 2.03 15.41 2.17 15.65 2.42C15.88 2.67 16 2.97 16 3.32Z"
						/>
					</clipPath>
					<clipPath id="menu" clipPathUnits="objectBoundingBox">
						<path
							transform={"scale(" + 1 / 15 + "," + 1 / 15 + ")"}
							d="M0.75 2.44H14.25C14.45 2.44 14.63 2.37 14.78 2.23C14.93 2.09 15 1.92 15 1.72C15 1.53 14.93 1.36 14.78 1.21C14.63 1.07 14.45 1 14.25 1H0.75C0.55 1 0.37 1.07 0.22 1.21C0.07 1.36 0 1.53 0 1.72C0 1.92 0.07 2.09 0.22 2.23C0.37 2.37 0.55 2.44 0.75 2.44ZM14.25 12.56H0.75C0.55 12.56 0.37 12.63 0.22 12.77C0.07 12.91 0 13.08 0 13.28C0 13.47 0.07 13.64 0.22 13.79C0.37 13.93 0.55 14 0.75 14H14.25C14.45 14 14.63 13.93 14.78 13.79C14.93 13.64 15 13.47 15 13.28C15 13.08 14.93 12.91 14.78 12.77C14.63 12.63 14.45 12.56 14.25 12.56ZM14.25 6.78H0.75C0.55 6.78 0.37 6.85 0.22 6.99C0.07 7.14 0 7.3 0 7.5C0 7.7 0.07 7.86 0.22 8.01C0.37 8.15 0.55 8.22 0.75 8.22H14.25C14.45 8.22 14.63 8.15 14.78 8.01C14.93 7.86 15 7.7 15 7.5C15 7.3 14.93 7.14 14.78 6.99C14.63 6.85 14.45 6.78 14.25 6.78Z"
						/>
					</clipPath>
				</svg>
			</header>
			{/* <AdSence /> */}
			<div className={c_header.blur}></div>
		</>
	);
}
