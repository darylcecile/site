"use client";

import useIsNonAppleMobile from "@/lib/hooks/useIsNonAppleMobile";
import { useEffect } from "react";

/**
 * Toggles the `reduce-bg-motion` class on the document root for non-Apple mobile
 * phones, which disables the animated background gradient (see rays.css) to
 * avoid scroll/paint jank on lower-powered mobile GPUs. Renders nothing.
 */
export default function BackgroundMotionGate() {
	const isNonAppleMobile = useIsNonAppleMobile();

	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle("reduce-bg-motion", isNonAppleMobile);

		return () => {
			root.classList.remove("reduce-bg-motion");
		};
	}, [isNonAppleMobile]);

	return null;
}
