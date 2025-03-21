import type { ReactNode } from "react";
import styles from "./../styles/infobox.module.scss";
import { cn } from "@/lib/utils";

type InfoBoxProps = {
	children: ReactNode;
	preText?: string;
	type?: "info" | "warn" | "error" | "success";
};

export default function InfoBox(props: InfoBoxProps) {
	const type = props.type ?? "info";

	return (
		<div
			className={
				cn("p-4 rounded-lg not-prose", {
					"bg-blue-500/10 text-blue-500 dark:bg-[deepskyblue]/20 dark:text-[deepskyblue]": type === "info",
					"bg-amber-500/10 text-amber-500 dark:bg-[gold]/20 dark:text-[gold]": type === "warn",
					"bg-[hotpink]/20 text-[hotpink]": type === "error",
					"bg-green-500/10 text-green-500 dark:bg-[#6ed718]/20 dark:text-[#6ed718]": type === "success",
				})
			}
			data-format={props.type ?? "info"}
		>
			<div className="m-0">
				{!!props.preText && <strong>{props.preText}</strong>}
				{props.children}
			</div>
		</div>
	);
}
