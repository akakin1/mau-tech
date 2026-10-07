/** @type {import('next').NextConfig} */

const TerserPlugin = require("terser-webpack-plugin");
const isProd = process.env.NODE_ENV === "production";

module.exports = {
	output: "export",
	outputFileTracingRoot: __dirname,
	env: {
		title: "2001Y's Site",
		domain: "https://2001y.me",
		wpURL: "https://yoshikitam.wpx.jp/2001y/wp-json/wp/v2"
	},
	async redirects() {
		return [
			{
				source: "/works",
				destination: "/",
				permanent: false,
			},
			{
				source: "/blog/web/:slug",
				destination: "/blog/:slug",
				permanent: true,
			},
			{
				source: "/blog/gadget/:slug",
				destination: "/blog/:slug",
				permanent: true,
			},
			{
				source: "/blog/camera/:slug",
				destination: "/blog/:slug",
				permanent: true,
			},
			{
				source: "/blog/other/:slug",
				destination: "/blog/:slug",
				permanent: true,
			},
		];
	},
	// Customa
	reactStrictMode: true,
	sassOptions: {
		prependData: '@use "sass:math"; @use "sass:color"; @use "sass:list"; @use "sass:map"; @use "styles/_prepend.scss" as *;',
	},
	images: {
		unoptimized: true,
		domains: ["yoshikitam.wpx.jp", "github.com"],
		formats: ["image/avif", "image/webp"],
	},
	webpack(config, options) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ["@svgr/webpack"],
		});

		config.optimization.minimize = isProd;
		config.optimization.minimizer = [
			new TerserPlugin({
				terserOptions: {
					compress: {
						drop_console: isProd,
					},
				},
				extractComments: "all",
			}),
		];
		return config;
	},
};
