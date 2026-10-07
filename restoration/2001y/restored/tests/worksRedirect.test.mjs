import test from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config.js";

test("/works remains a safe alias for the portfolio listing", async () => {
	const redirects = await nextConfig.redirects();
	assert.deepEqual(
		redirects.find((redirect) => redirect.source === "/works"),
		{
			source: "/works",
			destination: "/",
			permanent: false,
		},
	);
});
