import type { ComponentProps, ImgHTMLAttributes } from "react";

type ResponsiveImgRendererProps = {
	src: string;
	alt: string;
	sizes?: Array<number>;
	quality?: number;
	loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
} & ComponentProps<'img'>;

function ResponsiveImg(props: ResponsiveImgRendererProps) {
	const { src, alt, sizes, quality, loading, ...innerProps } = props;

	const isSrcValid = URL.canParse(src);

	const defaultSizes = sizes ?? [
		640, 750, 828, 1080, 1200, 1920, 2048, 3840,
	];
	const srcSet = defaultSizes.map(
		(size) =>
			`/_next/image?url=${encodeURIComponent(src)}&w=${size}&q=${quality ?? 75} ${size}w`,
	);

	return (
		<img
			{...innerProps}
			src={isSrcValid ? src : `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=${quality ?? 90}`}
			alt={alt}
			decoding={"async"}
			loading={loading ?? "lazy"}
			srcSet={isSrcValid ? undefined : srcSet.join(", ")}
			style={{
				aspectRatio: "auto 16 / 9",
				width: "100%",
			}}
		/>
	);
}

export default function ResponsiveImgRenderer(props: ComponentProps<'img'>) {
	if (props.alt) {
		return (
			<figure>
				<ResponsiveImg
					src={props.src}
					alt={props.alt}
					loading={props.loading ?? "lazy"}
				/>
				<figcaption>{props.alt}</figcaption>
			</figure>
		);
	}

	return (
		<ResponsiveImg
			src={props.src}
			alt={props.alt ?? ""}
			decoding={"async"}
			loading={props.loading ?? "lazy"}
			width={props.width}
			height={props.height}
		/>
	);
}