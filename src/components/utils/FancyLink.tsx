import { cn } from "@/lib/utils";
import type { LinkProps } from "next/link";
import Link from "next/link";
import { Suspense, type PropsWithChildren } from "react";
import { GitHubUser } from "../SocialPreview/GithubSocialPreview";

type Props = PropsWithChildren<{
	hideFavicon?: boolean;
	className?: string;
	faviconUrlOverride?: string;
	ghVariant?: "default" | "heatmap";
	manualColor?: boolean
} & LinkProps>;

const base = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000';
// const FAV_URL = "https://icons.duckduckgo.com/ip3/{{host}}.ico";
const FAV_URL = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={{origin}}&size=32";

function getFaviconUrl(url: string) {
	const host = new URL(url, base).host;
	const origin = new URL(url, base).origin;
	const favUrl = FAV_URL.replace("{{origin}}", origin).replace("{{host}}", host);
	return favUrl;
}

const URL_IGNORE_LIST = [
	"https://twitter.com/",
	"https://projectfunction.io/"
]

const URL_REWRITE_LIST = [
	{ from: 'https://projectfunction.io', to: 'https://web.archive.org/web/20240829122815/https://projectfunction.io' },
];

const SPECIAL_ACCOUNT = [
	{ github: 'rizbizkits', website: 'https://rizwanakhan.com', twitter: 'rizbizkits' },
	{ github: 'darylcecile', website: 'https://darylcecile.net', twitter: 'darylcecile' },
	{ github: 'megbird', website: 'https://megbird.me', twitter: 'itsmegbird' },
	{ github: 'carolgilabert', website: 'https://carol.gg' },
	{ github: 'monatheoctocat' },
];

export default function FancyLink(props: Props) {
	const { hideFavicon, faviconUrlOverride, ghVariant, manualColor, ...rest } = props;
	const url = props.href.toString();
	const shouldHideFavicon = hideFavicon || URL_IGNORE_LIST.some(prefix => url.startsWith(prefix)) || ((url.startsWith('#') || url.startsWith('/')) && !faviconUrlOverride);

	const account = SPECIAL_ACCOUNT.find(account => {
		const githubOptions = [
			`https://github.com/${account.github}`,
			`https://github.com/${account.github}/`,
			`https://github.com/@${account.github}`,
			`https://github.com/@${account.github}/`
		]
		if (githubOptions.includes(url)) return true;
		if (url === account.website || url === `${account.website}/`) return true;
		if (account.twitter && url === `https://twitter.com/${account.twitter}`) return true;
		if ((account.twitter && url === `@${account.twitter}`) || url === `@${account.github}`) return true;
		return false;
	});

	const rewrite = URL_REWRITE_LIST.find(item => url.startsWith(item.from));
	const correctedUrl = rewrite ? url.replace(rewrite.from, rewrite.to) : url;

	const usableUrl = correctedUrl.startsWith('@') ? (account?.website ?? correctedUrl) : correctedUrl;
	const isExternal = guessIsExternal(usableUrl);

	const el = (
		<Link
			{...rest}
			href={usableUrl}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noopener noreferrer" : undefined}
			className={cn(
				"text-foreground",
				props.className,
				// "font-normal underline underline-offset-4 not-prose whitespace-break-spaces",
				"before:absolute before:-z-1 z-0 before:transparent before:w-full before:h-4 before:left-0 before:top-0.25 before:rounded-xs before:outline-4 before:outline-transparent",
				"relative font-normal whitespace-nowrap not-prose",
				"focus-visible:before:bg-current/10 focus-visible:before:outline-current/10 focus-within:outline-none",
				"underline underline-offset-4 hover:no-underline focus-visible:no-underline",
				"hover:before:bg-current/10 hover:before:outline-current/10",
				!manualColor ? generateColorFromText(url) : "",
				{ "pl-5 relative": !shouldHideFavicon },
			)}
		>
			{!shouldHideFavicon && (
				<img
					src={faviconUrlOverride ?? getFaviconUrl(correctedUrl as string)}
					alt=""
					className="w-4 h-4 min-w-4 min-h-4 aspect-square my-0 rounded inline not-prose absolute left-0 top-0.25"
				/>
			)}
			{props.children}
		</Link>
	);

	if (account) {
		return <GitHubUser handle={account.github} variant={ghVariant}>{el}</GitHubUser>
	}

	return el;
}

function guessIsExternal(url: string): boolean {
	const BASE = 'https://darylcecile.net';
	const HOME = new URL(BASE);

	if (URL.canParse(url, BASE)) {
		const u = new URL(url, BASE);

		if (!u.host.endsWith(HOME.host)) {
			// if the host is not the same as the base, it's external
			return true;
		}

		return false;
	}

	return true;
}

function generateColorFromText(text: string) {
	// convert the text to a nummber between 0 and 7
	const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const index = hash % 7;
	const colors = [
		"hover:text-red-700 dark:hover:text-red-400 focus-visible:text-red-700 dark:focus-visible:text-red-400",
		"hover:text-yellow-700 dark:hover:text-yellow-400 focus-visible:text-yellow-700 dark:focus-visible:text-yellow-400",
		"hover:text-green-700 dark:hover:text-green-400 focus-visible:text-green-700 dark:focus-visible:text-green-400",
		"hover:text-blue-700 dark:hover:text-blue-400 focus-visible:text-blue-700 dark:focus-visible:text-blue-400",
		"hover:text-indigo-700 dark:hover:text-indigo-400 focus-visible:text-indigo-700 dark:focus-visible:text-indigo-400",
		"hover:text-purple-700 dark:hover:text-purple-400 focus-visible:text-purple-700 dark:focus-visible:text-purple-400",
		"hover:text-pink-700 dark:hover:text-pink-400 focus-visible:text-pink-700 dark:focus-visible:text-pink-400",
	];
	return colors[index];
}