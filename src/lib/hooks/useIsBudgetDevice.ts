import { useEffect, useState } from "react";

type DeviceInfoNavigator = Navigator & {
	deviceMemory?: number;
};

/**
 * Detects "budget" devices where heavy compositor effects such as
 * `backdrop-filter: blur()` over scrolling content cause noticeable scroll jank.
 *
 * `deviceMemory` is only exposed by Chromium-based browsers (e.g. Android Chrome),
 * which are the platforms reporting the slow scroll. Apple devices (iOS Safari)
 * don't expose `deviceMemory` and handle backdrop blur efficiently via the GPU,
 * so they intentionally stay on the blur path.
 *
 * Returns `false` during SSR and the first client render to avoid hydration
 * mismatches, then resolves to the real value after mount.
 */
export default function useIsBudgetDevice() {
	const [isBudget, setIsBudget] = useState(false);

	useEffect(() => {
		if (typeof navigator === "undefined") return;

		const nav = navigator as DeviceInfoNavigator;
		const memory = nav.deviceMemory;
		const cores = nav.hardwareConcurrency;

		let budget = false;

		if (typeof memory === "number") {
			// Chromium reports 0.25 - 8 (capped). <= 4 covers low/mid-range Android.
			budget = memory <= 4;
		} else if (typeof cores === "number") {
			// Fallback for browsers without deviceMemory: only flag very low core counts
			// so we don't misclassify Apple devices (which handle blur well).
			budget = cores <= 2;
		}

		setIsBudget(budget);
	}, []);

	return isBudget;
}
