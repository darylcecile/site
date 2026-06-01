"use client";

import useIsBudgetDevice from "@/lib/hooks/useIsBudgetDevice";

/**
 * The bottom fade that sits over the scrolling content (behind the floating nav).
 *
 * On capable devices it uses a `backdrop-filter` blur for a frosted look. On
 * budget devices that effect re-rasterizes the area on every scroll frame and
 * causes scroll jank, so we fall back to a cheap, static gradient that fades the
 * content into the background colour instead.
 */
export default function BottomBlur() {
	const isBudgetDevice = useIsBudgetDevice();

	if (isBudgetDevice) {
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
