"use client";

import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import customParse from "dayjs/plugin/customParseFormat";
import advanceFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(customParse);
dayjs.extend(advanceFormat);

export default function LocalDate({ dateString: isoDateString }: { dateString: string }) {
	const [isoDate, setIsoDate] = useState<dayjs.Dayjs>(() => dayjs());

	useEffect(() => {
		setIsoDate(dayjs(isoDateString, 'YYYY-MM-DD'));
	}, [isoDateString]);

	return (
		<time dateTime={isoDateString}>
			{isoDate.format("dddd Do MMM, YYYY")}
		</time>
	);
}
