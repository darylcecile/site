import type { PropsWithChildren } from "react";
import "./rays.css";
import { cn } from "@/lib/utils";

export function Rays({ children, style, className }: PropsWithChildren<{ style?: React.CSSProperties, className?: string }>) {
	return (
		<div className={cn("jumbo", className)} style={style}>
			{children}
		</div>
	)
}