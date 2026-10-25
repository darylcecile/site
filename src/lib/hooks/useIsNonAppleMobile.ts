import { useEffect, useState } from "react";

type UADataNavigator = Navigator & {
	userAgentData?: {
		mobile?: boolean;
		platform?: string;
	};
	connection?: {
		saveData?: boolean;
	};
};

/** Devices with this many logical cores or fewer are treated as low-power. */
const LOW_CORE_THRESHOLD = 2;

/**
 * Detects a non-Apple mobile phone (e.g. Android) or another low-power/constrained
 * environment (low CPU core count, data-saver mode enabled), where heavy
 * full-screen GPU effects such as the animated, blurred background gradient
 * cause jank.
 *
 * iPhones (and other Apple devices) handle these effects smoothly via their GPU,
 * so they are intentionally excluded and keep the animation regardless of the
 * other signals.
 *
 * Detection order:
 *  1. User-Agent Client Hints (`navigator.userAgentData`) on Chromium/Android.
 *  2. Fallback to userAgent + `maxTouchPoints` for Safari/iOS/iPadOS, which
 *     don't expose UA-CH.
 *  3. `navigator.hardwareConcurrency` below `LOW_CORE_THRESHOLD`, which flags
 *     older/weaker desktops and laptops regardless of form factor.
 *  4. `navigator.connection.saveData`, which signals the user has explicitly
 *     opted into a reduced-resource-usage mode.
 *
 * Returns `false` during SSR and the first client render to avoid hydration
 * mismatches, then resolves after mount.
 */
export default function useIsNonAppleMobile() {
	const [isNonAppleMobile, setIsNonAppleMobile] = useState(false);

	useEffect(() => {
		if (typeof navigator === "undefined") return;

		const nav = navigator as UADataNavigator;
		const ua = nav.userAgent || "";
		const maxTouchPoints = nav.maxTouchPoints || 0;

		// iPadOS 13+ reports as "Macintosh"; the touch points trick disambiguates.
		const isIOS =
			/iPhone|iPad|iPod/.test(ua) ||
			(/Macintosh/.test(ua) && maxTouchPoints > 1);
		const isApple = isIOS || /Apple/i.test(nav.vendor || "");
		const hasMobileToken = /Mobile|Mobi/i.test(ua);
		const isAndroidPhoneUA = /Android/i.test(ua) && hasMobileToken;

		let isMobile: boolean;
		if (typeof nav.userAgentData?.mobile === "boolean") {
			// UA-CH can be missing or inaccurate on some Android builds/browser modes.
			isMobile = nav.userAgentData.mobile || isAndroidPhoneUA;
		} else {
			// Android phone UAs include "Android" + "Mobile"; tablets omit "Mobile".
			isMobile = hasMobileToken;
		}

		const hasLowCoreCount =
			typeof nav.hardwareConcurrency === "number" &&
			nav.hardwareConcurrency > 0 &&
			nav.hardwareConcurrency <= LOW_CORE_THRESHOLD;
		const hasSaveDataEnabled = nav.connection?.saveData === true;
		const isLowPower = hasLowCoreCount || hasSaveDataEnabled;

		setIsNonAppleMobile((isMobile || isLowPower) && !isApple);
	}, []);

	return isNonAppleMobile;
}
