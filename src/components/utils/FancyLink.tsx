import { cn } from "@/lib/utils";
import type { LinkProps } from "next/link";
import Link from "next/link";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	hideFavicon?: boolean;
	className?: string;
} & LinkProps>;

const base = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` || 'http://localhost:3000';

export default function FancyLink(props: Props) {
	const origin = new URL(props.href as string, base).host;
	return (
		<Link
			{...props}
			className={cn(
				props.className,
				{ "pl-5 relative": !props.hideFavicon },
			)}
			data-peg={origin}
		>
			{!props.hideFavicon && (
				<img
					src={`https://icons.duckduckgo.com/ip3/${origin}.ico`}
					alt=""
					className="w-4 h-4 my-0 rounded inline not-prose absolute left-0 top-0.5"
				/>
			)}
			{props.children}
		</Link>
	)
}