import { useEffect, useState } from "react";

type UADataNavigator = Navigator & {
	userAgentData?: {
		mobile?: boolean;
		platform?: string;
	};
};

/**
 * Detects a non-Apple mobile phone (e.g. Android), where heavy full-screen GPU
 * effects such as the animated, blurred background gradient cause jank.
 *
 * iPhones (and other Apple devices) handle these effects smoothly via their GPU,
 * so they are intentionally excluded and keep the animation.
 *
 * Detection order:
 *  1. User-Agent Client Hints (`navigator.userAgentData`) on Chromium/Android.
 *  2. Fallback to userAgent + `maxTouchPoints` for Safari/iOS/iPadOS, which
 *     don't expose UA-CH.
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

		let isMobile: boolean;
		if (typeof nav.userAgentData?.mobile === "boolean") {
			isMobile = nav.userAgentData.mobile;
		} else {
			// "Mobile"/"Mobi" is present on phone UAs; Android tablets omit it.
			isMobile = /Mobi/i.test(ua);
		}

		setIsNonAppleMobile(isMobile && !isApple);
	}, []);

	return isNonAppleMobile;
}
