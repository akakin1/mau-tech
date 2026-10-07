import urlJoin from "url-join";
import { snapshotResponse } from "./wordpressSnapshot.mjs";

const WORDPRESS_FETCH_ATTEMPTS = 3;

async function cmsFetch(url) {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
		if (response.ok || (response.status < 500 && response.status !== 408 && response.status !== 429)) return response;
		const snapshot = await snapshotResponse(url);
		return snapshot || response;
	} catch (error) {
		const snapshot = await snapshotResponse(url);
		if (snapshot) return snapshot;
		throw error;
	}
}

function isRetryableStatus(status) {
	return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

async function waitForRetry(attempt, path, error) {
	console.warn("WordPress API request failed; retrying", {
		attempt,
		maxAttempts: WORDPRESS_FETCH_ATTEMPTS,
		path,
		errorName: error instanceof Error ? error.name : "UnknownError",
		errorMessage: error instanceof Error ? error.message : String(error),
	});
	await new Promise((resolve) => setTimeout(resolve, attempt * 250));
}

async function fetchResponse(url, path) {
	let lastError;
	for (let attempt = 1; attempt <= WORDPRESS_FETCH_ATTEMPTS; attempt++) {
		try {
			const response = await cmsFetch(url);
			if (!response.ok) {
				const error = Object.assign(
					new Error(`WordPress API returned HTTP ${response.status} for ${path}`),
					{ status: response.status }
				);
				if (!isRetryableStatus(response.status)) throw error;
				throw error;
			}
			return response;
		} catch (error) {
			lastError = error;
			const errorStatus = typeof error === "object" && error !== null && "status" in error
				? error.status
				: undefined;
			if (typeof errorStatus === "number" && !isRetryableStatus(errorStatus)) throw error;
			if (attempt < WORDPRESS_FETCH_ATTEMPTS) {
				await waitForRetry(attempt, path, error);
			}
		}
	}
	throw Object.assign(
		new Error(`WordPress API request failed after ${WORDPRESS_FETCH_ATTEMPTS} attempts for ${path}`),
		{ cause: lastError }
	);
}

export async function json(e) {
	const url = urlJoin(process.env.wpURL, e);
	const path = new URL(url).pathname;
	let lastError;

	for (let attempt = 1; attempt <= WORDPRESS_FETCH_ATTEMPTS; attempt++) {
		let response;
		try {
			response = await cmsFetch(url);
		} catch (error) {
			lastError = error;
			if (attempt < WORDPRESS_FETCH_ATTEMPTS) {
				await waitForRetry(attempt, path, error);
			}
			continue;
		}

		if (!response.ok) {
			const error = new Error(`WordPress API returned HTTP ${response.status} for ${path}`);
			if (!isRetryableStatus(response.status)) {
				throw error;
			}
			lastError = error;
			if (attempt < WORDPRESS_FETCH_ATTEMPTS) {
				await waitForRetry(attempt, path, error);
			}
			continue;
		}

		try {
			return await response.json();
		} catch (error) {
			lastError = error;
			if (attempt < WORDPRESS_FETCH_ATTEMPTS) {
				await waitForRetry(attempt, path, error);
			}
		}
	}

	throw Object.assign(
		new Error(`WordPress API request failed after ${WORDPRESS_FETCH_ATTEMPTS} attempts for ${path}`),
		{ cause: lastError }
	);
}

export async function GETpostList(tags) {
	const url = urlJoin(
		process.env.wpURL,
		"posts?per_page=18&_fields=id,title,slug,date,voting,tags" + tags
	);
	const path = new URL(url).pathname;
	let lastError;

	for (let attempt = 1; attempt <= WORDPRESS_FETCH_ATTEMPTS; attempt++) {
		try {
			const response = await cmsFetch(url);
			if (!response.ok) {
				const error = Object.assign(
					new Error(`WordPress API returned HTTP ${response.status} for ${path}`),
					{ status: response.status }
				);
				if (!isRetryableStatus(response.status)) throw error;
				throw error;
			}
			return {
				postList: await response.json(),
				totalpages: response.headers.get("x-wp-totalpages"),
			};
		} catch (error) {
			lastError = error;
			const errorStatus = typeof error === "object" && error !== null && "status" in error
				? error.status
				: undefined;
			if (typeof errorStatus === "number" && !isRetryableStatus(errorStatus)) throw error;
			if (attempt < WORDPRESS_FETCH_ATTEMPTS) {
				await waitForRetry(attempt, path, error);
			}
		}
	}

	throw Object.assign(
		new Error(`WordPress API request failed after ${WORDPRESS_FETCH_ATTEMPTS} attempts for ${path}`),
		{ cause: lastError }
	);
}
export async function GETpost(slug) {
	var res = await json("/posts?slug=" + encodeURI(slug));
	// console.log(res);
	return res[0];
}
export async function GETwp(url) {
	let a = await json(url);
	return a;
}
export async function GETwpList(url) {
	const firstPageUrl = urlJoin(process.env.wpURL, url);
	const firstResponse = await fetchResponse(firstPageUrl, new URL(firstPageUrl).pathname);
	const totalpages = Number(firstResponse.headers.get("x-wp-totalpages") || 1);
	const wpBaseUrl = process.env.wpURL;
	if (typeof wpBaseUrl !== "string") {
		throw new Error("wpURL must be an absolute URL");
	}
	let wpBasePath;
	try {
		wpBasePath = new URL(wpBaseUrl).pathname.replace(/\/$/, "");
	} catch {
		throw new Error("wpURL must be an absolute URL");
	}

	let res = await Promise.all(
		Array(Number(totalpages))
			.fill(0)
			.map(async (_, i) => {
				const pageUrl = new URL(firstPageUrl);
				pageUrl.searchParams.set("page", String(i + 1));
				const relativePath = pageUrl.pathname.startsWith(wpBasePath)
					? pageUrl.pathname.slice(wpBasePath.length) || "/"
					: pageUrl.pathname;
				if (i === 0) return firstResponse.json();
				return json(relativePath + pageUrl.search);
			})
	);
	return res.flat();
}

export async function tagTop() {
	var res = await json("/tags?per_page=3&orderby=count&order=desc");
	return tagList(res);
}
export async function tag(slug) {
	var res = await json("/tags?slug=" + encodeURI(slug));
	return res[0];
}
export async function tagList(res) {
	var mainTags = res.map((e, i) => e.id);

	// 各tagListの調整
	const viewTagIds = new Set(mainTags); //表示されてる全ての記事
	res = res
		.reverse()
		.map((e, i) => {
			let count = 0; //親タグあたりの子タグの数
			e.tagList = e.tagList.filter((e1) => {
				if (!viewTagIds.has(e1.id)) {
					if (count < 3) {
						viewTagIds.add(e1.id);
						count++;
						return true;
					}
				}
				return false;
			});
			return e;
		})
		.reverse();

	// Latestタグ追加
	res.push({
		id: "latest",
		name: "Latest",
		// slug: "/",
		tagList: await latestTagList(),
	});
	async function latestTagList() {
		const viewTagIds = new Set(res
			.map((e) => e.tagList.map((e1) => e1.id))
			.concat(mainTags)
			.flat());
		let topTag100 = await json(
			"/tags?per_page=100&orderby=count&order=desc&_fields=id,name,slug,count,allCount"
		);
		return topTag100.filter((e) => !viewTagIds.has(e.id)).slice(0, 3);
	}

	// 記事追加
	res = await Promise.all(
		res.map(async (e, i) => {
			// 各親タグの記事取得
			let fetch;
			if (e.id == "latest") {
				fetch = await GETpostList("");
			} else {
				fetch = await GETpostList("&tags=" + e.id);
			}
			e.postList = fetch.postList;
			e.totalpages = fetch.totalpages;
			return e;
		})
	);
	// 記事の重複削除
	const viewPostIds = new Set(); //表示されてる全ての記事
	res = res
		.reverse()
		.map((e, i, selfArr) => {
			// 親タグ別の処理
			let count = 0; //タグ別の記事の数
			e.postList = e.postList.filter((e1, i1) => {
				// 記事ごとの処理
				if (count < 12) {
					if (!viewPostIds.has(e1.id)) {
						// 重複がない場合
						viewPostIds.add(e1.id);
						count++;
						return true;
					}
				}
				return false;
			});
			return e;
		})
		.reverse();

	return res;
}
