import { ImageResponse } from "@vercel/og";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import noteData from "@/../public/notes.json";
import profileImage from "@/app/icon.png";
import { cn } from "@/lib/utils";
import dayjs from 'dayjs';
import customParse from 'dayjs/plugin/customParseFormat';
import advanceFormat from 'dayjs/plugin/advancedFormat';
import { GeistSans } from "geist/font/sans";

dayjs.extend(customParse);
dayjs.extend(advanceFormat);

export const runtime = "edge";

const base = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000';

export async function GET(opt: NextRequest): Promise<Response> {
	const { searchParams } = new URL(opt.url);

	if (!searchParams.has("slug")) {
		if (searchParams.has("page")) {
			return new ImageResponse(
				<SimpleImage
					title={`/${searchParams.get("page")?.toLowerCase()}`}
					subHeading={"@darylcecile"}
					theme={searchParams.has("dark") ? "dark" : "light"}
				/>,
			) as Response;
		}

		if (searchParams.has("header")) {
			return new ImageResponse(
				<SimpleImage
					title={"Hey! I'm Daryl 👋🏾"}
					subHeading={"@darylcecile"}
					theme={searchParams.has("dark") ? "dark" : "light"}
				/>,
			) as Response;
		}

		return new ImageResponse(
			<SimpleImage
				title={"Hey! I'm Daryl 👋🏾"}
				subHeading={"@darylcecile"}
				theme={searchParams.has("dark") ? "dark" : "light"}
			/>,
		) as Response;
	}

	const post = noteData.items.find(
		(item) => item.slug === searchParams.get("slug"),
	);

	if (!post) return notFound();

	return new ImageResponse(
		<AdvanceImage
			title={post.title}
			authorName={post.author[0].name}
			readTime={post.readTime}
			theme={searchParams.has("dark") ? "dark" : "light"}
		/>
	) as Response;
}

function SimpleImage({ title, theme, subHeading }) {
	const bg = theme === 'dark' ? 'black' : 'white';
	return (
		<div
			style={{
				background: `radial-gradient(circle at 50% -20%, ${bg} 0%, ${bg} 50%, ${theme === 'dark' ? '#022f2e' : '#cbfbf1'} 100%)`,
			}}
			tw="w-full h-full flex flex-col justify-center items-center p-16"
		>
			<img
				src={new URL(profileImage.src, base).href}
				alt=""
				style={{
					width: 128,
					height: 128,
				}}
			/>
			<span
				style={{
					fontSize: 26,
					marginTop: 24,
					padding: 5,
					marginBottom: 32,
				}}
				tw={theme === 'dark' ? "text-purple-200/80" : "text-purple-900/80"}
			>
				{subHeading}
			</span>
			<p
				style={{
					fontSize: 74,
					maxWidth: "100%",
					lineHeight: 1.2,
					whiteSpace: "nowrap",
					textAlign: "center",
				}}
				tw={theme === 'dark' ? "text-teal-100" : "text-teal-900"}
			>
				{title}
			</p>


			<div
				className={GeistSans.className}
				tw={cn("absolute -bottom-6 left-0 right-0 h-12")}
				style={{
					// rainbow gradient
					backgroundImage:
						"linear-gradient(to right, indigo, violet, red, orange, yellow, green, deepskyblue)",
					filter: "blur(20px)",
				}}
			/>
		</div>
	);
}

function AdvanceImage({ title, authorName, theme, readTime }) {
	const bg = theme === 'dark' ? 'black' : 'white';
	return (
		<div
			tw={"w-full h-full flex flex-col justify-center p-16"}
			style={{
				background: `linear-gradient(to bottom right, ${bg} 0%, ${bg} 50%, ${theme === 'dark' ? '#022f2e' : '#cbfbf1'} 100%)`,
			}}
			className={GeistSans.className}
		>
			<p
				tw={theme === 'dark' ? "text-teal-100" : "text-teal-900"}
				style={{
					fontSize: 74,
					maxWidth: "70%",
					lineHeight: 1.05,
				}}
			>
				{title}
			</p>
			<span
				tw={theme === 'dark' ? "text-orange-200/80" : "text-orange-900/80"}
				style={{
					fontSize: 26,
					marginTop: 16,
					padding: 5,
				}}
			>
				{authorName}&emsp;&mdash;&emsp;{readTime}
			</span>

			<div tw="mt-auto flex flex-row items-center">
				<img
					src={new URL(profileImage.src, base).href}
					alt=""
					style={{
						height: 75,
						aspectRatio: "1/1",
					}}
					tw=" rounded-full"
				/>

				<div tw={cn("flex flex-col ml-2", theme === 'dark' ? 'text-purple-300/80' : 'text-purple-900/80')}>
					<p tw="m-0 text-xl font-bold">Daryl Cecile</p>
					<p tw="m-0 opacity-60">darylcecile.net/notes</p>
				</div>
			</div>

			<div
				className={GeistSans.className}
				tw={cn("absolute -bottom-6 left-0 right-0 h-12")}
				style={{
					// rainbow gradient
					backgroundImage:
						"linear-gradient(to right, indigo, violet, red, orange, yellow, green, deepskyblue)",
					filter: "blur(20px)",
				}}
			/>
		</div>
	);
}
