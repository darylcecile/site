import { type NextConfig } from "next";
import { join } from "node:path";

const ideaContent = ['./src/ideas_markdown/**/*', './src/ideas_markdown/.gitkeep'];

export default {
	transpilePackages: ["next-mdx-remote"],
	serverExternalPackages: ["@shikijs/twoslash"],
	output: "standalone",
	// Studio resolves collection paths at runtime, beyond automatic file tracing.
	outputFileTracingIncludes: {
		'/': ideaContent,
		'/ideas': ideaContent,
		'/ideas/*': ideaContent,
	},
	experimental: {
		viewTransition: true,
	},
	turbopack: {
		root: join(__dirname, ".."),
	},
	cacheComponents: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com'
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/mastodon",
				destination: "https://techhub.social/@daryl",
				permanent: true,
			},
			{
				source: "/twitter",
				destination: "https://twitter.com/darylcecile",
				permanent: true,
			},
			{
				source: "/github",
				destination: "https://github.com/darylcecile",
				permanent: true,
			}
		];
	},
	async rewrites() {
		return [
			{
				source: "/.well-known/webfinger",
				destination: "/webfinger",
			},
			{
				source: "/r/images.unsplash.com/:path*",
				destination: "https://images.unsplash.com/:path*",
			},
			{
				source: "/home",
				destination: "/",
			},
		];
	},
} satisfies NextConfig
