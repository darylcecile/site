import type { NextConfig } from "next";


export default {
	transpilePackages: ["next-mdx-remote"],
	serverExternalPackages: ["@shikijs/twoslash"]
} satisfies NextConfig