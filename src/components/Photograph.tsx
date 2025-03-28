"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"

interface PhotoDeveloperProps {
	imageUrl: string
	width: number
	height: number
}

export default function Photography({ imageUrl, width, height }: PhotoDeveloperProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [isHovering, setIsHovering] = useState(false)
	const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null)
	const animationRef = useRef<number | null>(null)
	const progressRef = useRef(0)

	// Color channels to reveal in sequence
	const colorSequence = ["yellow", "red", "green", "blue"]

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		const img = new Image()
		img.crossOrigin = "anonymous" // Prevent CORS issues
		img.src = imageUrl

		img.onload = () => {
			// Calculate aspect ratio to maintain proportions
			const aspectRatio = img.width / img.height
			let drawWidth = width
			let drawHeight = height

			if (width / height > aspectRatio) {
				drawWidth = height * aspectRatio
			} else {
				drawHeight = width / aspectRatio
			}

			// Center the image
			const offsetX = (width - drawWidth) / 2
			const offsetY = (height - drawHeight) / 2

			// Draw the image
			ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

			// Store the original image data
			setOriginalImageData(ctx.getImageData(0, 0, width, height))

			// Initially show grayscale version
			const imageData = ctx.getImageData(0, 0, width, height)
			const data = imageData.data

			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2]
				data[i] = gray // R
				data[i + 1] = gray // G
				data[i + 2] = gray // B
			}

			ctx.putImageData(imageData, 0, 0)
		}

		return () => {
			if (animationRef.current !== null) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [imageUrl, width, height])

	useEffect(() => {
		if (!canvasRef.current || !originalImageData) return

		const ctx = canvasRef.current.getContext("2d")
		if (!ctx) return

		// Reset progress when hover state changes
		progressRef.current = 0

		if (animationRef.current !== null) {
			cancelAnimationFrame(animationRef.current)
		}

		if (isHovering) {
			// Start the animation
			const animate = () => {
				if (!canvasRef.current || !originalImageData) return

				const ctx = canvasRef.current.getContext("2d")
				if (!ctx) return

				// Get current image data
				const currentImageData = ctx.getImageData(0, 0, width, height)
				const currentData = currentImageData.data
				const originalData = originalImageData.data

				// Increment progress
				progressRef.current += 0.01
				const progress = Math.min(progressRef.current, 1)

				// Determine which color channels to reveal based on progress
				const stageSize = 1 / colorSequence.length
				const currentStage = Math.floor(progress / stageSize)
				const stageProgress = (progress % stageSize) / stageSize

				for (let i = 0; i < currentData.length; i += 4) {
					// Start with grayscale
					const gray = 0.3 * originalData[i] + 0.59 * originalData[i + 1] + 0.11 * originalData[i + 2]

					// R channel
					currentData[i] = gray
					if (
						(currentStage >= 1 || (currentStage === 0 && colorSequence[0] === "red")) &&
						(currentStage > 0 || stageProgress > 0)
					) {
						const stageIdx = colorSequence.indexOf("red")
						const channelProgress = currentStage > stageIdx ? 1 : stageProgress
						currentData[i] = gray + (originalData[i] - gray) * channelProgress
					}

					// G channel
					currentData[i + 1] = gray
					if (
						(currentStage >= 1 || (currentStage === 0 && colorSequence[0] === "green")) &&
						(currentStage > 0 || stageProgress > 0)
					) {
						const stageIdx = colorSequence.indexOf("green")
						const channelProgress = currentStage > stageIdx ? 1 : stageProgress
						currentData[i + 1] = gray + (originalData[i + 1] - gray) * channelProgress
					}

					// B channel
					currentData[i + 2] = gray
					if (
						(currentStage >= 1 || (currentStage === 0 && colorSequence[0] === "blue")) &&
						(currentStage > 0 || stageProgress > 0)
					) {
						const stageIdx = colorSequence.indexOf("blue")
						const channelProgress = currentStage > stageIdx ? 1 : stageProgress
						currentData[i + 2] = gray + (originalData[i + 2] - gray) * channelProgress
					}

					// Yellow (R+G)
					if (
						(currentStage >= 1 || (currentStage === 0 && colorSequence[0] === "yellow")) &&
						(currentStage > 0 || stageProgress > 0)
					) {
						const stageIdx = colorSequence.indexOf("yellow")
						const channelProgress = currentStage > stageIdx ? 1 : stageProgress
						if (stageIdx === currentStage || currentStage > stageIdx) {
							currentData[i] = gray + (originalData[i] - gray) * channelProgress
							currentData[i + 1] = gray + (originalData[i + 1] - gray) * channelProgress
						}
					}
				}

				ctx.putImageData(currentImageData, 0, 0)

				if (progress < 1) {
					animationRef.current = requestAnimationFrame(animate)
				}
			}

			animationRef.current = requestAnimationFrame(animate)
		} else {
			// Revert to grayscale
			const imageData = ctx.getImageData(0, 0, width, height)
			const data = imageData.data

			for (let i = 0; i < data.length; i += 4) {
				const gray =
					0.3 * originalImageData.data[i] + 0.59 * originalImageData.data[i + 1] + 0.11 * originalImageData.data[i + 2]
				data[i] = gray // R
				data[i + 1] = gray // G
				data[i + 2] = gray // B
			}

			ctx.putImageData(imageData, 0, 0)
		}
	}, [isHovering, originalImageData, width, height])

	return (
		<div className="relative">
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				className="w-full h-auto rounded-lg shadow-lg cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
			/>
		</div>
	)
}


