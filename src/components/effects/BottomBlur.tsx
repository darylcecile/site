"use client";

import useBlurPerformanceMode from "@/lib/hooks/useBlurPerformanceMode";

/**
 * The bottom fade that sits over the scrolling content (behind the floating nav).
 *
 * On capable devices it uses a `backdrop-filter` blur for a frosted look. On
 * devices that can't render the live blur smoothly it re-rasterizes the area on
 * every scroll frame and causes scroll jank, so we fall back to a cheap, static
 * gradient that fades the content into the background colour instead.
 *
 * The choice is made by `useBlurPerformanceMode`, which measures real frame
 * times while the user scrolls rather than guessing from device specs.
 */
export default function BottomBlur() {
	const mode = useBlurPerformanceMode();

	if (mode === "gradient") {
		return (
			<div
				className="w-full h-[100px] bottom-0 fixed pointer-events-none z-40"
				style={{
					background: "linear-gradient(transparent, var(--background))",
				}}
			/>
		);
	}

	const maskGradient = "linear-gradient(transparent, black, black)";

	return (
		<div
			className="w-full h-[100px] bottom-0 fixed pointer-events-none z-40"
			style={{
				mask: maskGradient,
				WebkitMaskImage: maskGradient,
				backdropFilter: "blur(4px) saturate(180%)",
				WebkitBackdropFilter: "blur(4px) saturate(180%)",
			}}
		/>
	);
}
