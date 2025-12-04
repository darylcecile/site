


"use cache";
import { cacheLife } from "next/cache";
import ms from "ms";


export default function Footer() {
	cacheLife({ revalidate: ms("1d") / 1000 }); // 1 day in seconds, so copyright year updates quickly
	const copyrightYear = new Date().getFullYear();

	return (
		<footer className="max-w-2xl mx-auto w-full bg-background text-center py-8 pb-28 opacity-65">
			<div className="bg-background h-8 w-full shadow-foreground/50 shadow-[0px_10px_20px_-15px] z-10 mb-12" />
			<div className="max-w-2xl mx-auto gap-8 flex flex-col z-9">
				<p>Daryl Cecile © {copyrightYear}, Inc. All rights reserved.</p>
			</div>
		</footer>
	)
}