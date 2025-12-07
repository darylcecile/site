"use client";

import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import customParse from "dayjs/plugin/customParseFormat";
import advanceFormat from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(customParse);
dayjs.extend(advanceFormat);
dayjs.extend(timezone);

export default function LocalDate({ dateString: isoDateString, className }: { dateString: string, className?: string }) {
	const [dateFormatted, setDateFormatted] = useState<string>(() => dayjs(isoDateString, { format: 'YYYY-MM-DD', locale: 'en' }).format("dddd Do MMM, YYYY"));

	useEffect(() => {
		// run this to get the user's timezone
		const locale = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
		setDateFormatted(
			dayjs(isoDateString, {
				format: 'YYYY-MM-DD',
				locale: locale ?? 'en'
			}).format("dddd Do MMM, YYYY")
		);
	}, [isoDateString]);

	return (
		<time dateTime={`${isoDateString} T00:00:00Z`} className={className}>
			{dateFormatted}
		</time>
	);
}
