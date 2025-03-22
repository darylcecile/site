"use client";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel"
import ResponsiveImgRenderer from "./ResponsiveImgRenderer"

type GalleryRendererProps = {
	images: Record<string, string>,
}

export default function GalleryRenderer(props: GalleryRendererProps) {
	return (
		<Carousel className="w-full max-w-2xl mx-auto">
			<CarouselContent>
				{Object.entries(props.images).map(([src, alt]) => (
					<CarouselItem key={src}>
						<ResponsiveImgRenderer src={src} alt={alt} />
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	)
}
