"use cache";

import { cacheLife } from "next/cache";
import ms from "ms";


export default async function Footer() {
	cacheLife({ revalidate: ms("1d") / 1000 }); // 1 day in seconds, so copyright year updates quickly
	const copyrightYear = new Date().getFullYear();

	return (
		<footer className="max-w-2xl mx-auto w-full bg-background text-center py-8 pb-28 opacity-65">
			<div className="bg-background h-8 w-full shadow-foreground/50 shadow-[0px_10px_20px_-15px] z-10 mb-12" />
			<div className="max-w-2xl mx-auto gap-8 flex flex-col justify-between md:flex-row z-9">
				<span>
					© {copyrightYear} <a href="https://darylcecile.net/" className="h-card" rel="me">Daryl Cecile</a>.
				</span>
				<span className="gap-2 inline-flex mx-auto">
					<a href="https://xn--sr8hvo.ws/previous">←</a>
					An <a href="https://xn--sr8hvo.ws">IndieWeb Webring</a> 🕸💍
					<a href="https://xn--sr8hvo.ws/next">→</a>
				</span>
				<span>
					<a href="https://github.com/darylcecile" target="_blank" rel="noopener">An Open Source Site</a>
				</span>
			</div>
		</footer>
	)
}