import type { NextConfig } from "next";


export default {
	transpilePackages: ["next-mdx-remote"],
	serverExternalPackages: ["@shikijs/twoslash"],
	experimental: {
		viewTransition: true,
		cacheComponents: true, // Enabled for Next.js 16 stable
	},
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
				source: "/24-jun-25",
				destination: "https://gist.github.com/darylcecile/6ff45ea019d8817c76747689f830ae3f",
				permanent: true
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
