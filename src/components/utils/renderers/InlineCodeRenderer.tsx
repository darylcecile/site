import { cn } from "@/lib/utils";
import { GeistMono } from "geist/font/mono";

export function InlineCodeRenderer({ children }: { children: React.ReactNode }) {
	return (
		<span className={cn(GeistMono.className, 'text-foreground relative  whitespace-nowrap')}>
			<span className="z-0 block absolute dark:mix-blend-soft-light bg-purple-500/10 dark:bg-white -top-0.5 left-0 -bottom-0.5 right-0 rounded" />
			<span className={"px-1 py-0.5 z-1 relative text-sm whitespace-break-spaces"}>{children}</span>
		</span>
	)

	// return (
	// 	<span
	// 		className={cn(
	// 			GeistMono.className, 'text-foreground relative  whitespace-pre-line',
	// 			"px-1 py-0.5 z-1 relative text-sm ",
	// 			"before:z-0 before:block before:absolute before:mix-blend-soft-light before:bg-black before:dark:bg-white before:-top-0.5 before:left-0 before:-bottom-0.5 before:right-0 before:rounded"
	// 		)}
	// 	>{children}</span>
	// )
}