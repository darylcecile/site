import type { NextConfig } from "next";


export default {
	transpilePackages: ["next-mdx-remote"],
	serverExternalPackages: ["@shikijs/twoslash"],
	experimental: {
		viewTransition: true
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com'
			},
		],
	}
} satisfies NextConfig