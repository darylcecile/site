import type { PropsWithChildren } from 'react';
import { GeistSans } from 'geist/font/sans';
import { cn } from '@/lib/utils';
import { Github } from 'lucide-react';
import { GitHubUser, GitHubUserPill } from '../SocialPreview/GithubSocialPreview';
import HeaderClient from '@/components/header/index.client';
import KnoshIcon from "@/../public/knosh-icon.png";
import Image from 'next/image';
import { KnoshLogo } from '@/components/vectors/KnoshLogo';
import FancyLink from '../utils/FancyLink';

export function Header() {

	return (
		<div className="flex flex-col gap-8 min-h-screen items-center justify-center px-8">
			<div className="max-w-2xl mx-auto gap-8 flex flex-col">
				<div>
					<HeaderClient />
				</div>
				<div
					className={cn(
						GeistSans.className,
						'text-foreground h-full flex justify-center flex-col gap-2 items-center'
					)}
				>
					<h1 className={'leading-8 tracking-wide text-3xl font-semibold text-balance'}>
						Hey! I'm Daryl
					</h1>
					<p className={'text-foreground leading-4 tracking-wide text-lg text-balance flex gap-0.5 items-center'}>
						Software Engineer at
						<GitHubUser handle="darylcecile">
							<a
								href="https://github.com/darylcecile"
								className='flex items-center gap-0.5 hover:text-blue-500'
							>
								<Github className="ml-1 w-5 h-5 flex items-center justify-center" strokeWidth={2} /> GitHub
							</a>
						</GitHubUser>
					</p>
					{/* <p
						className={cn(
							GeistMono.className,
							'text-foreground leading-4 tracking-wide text-lg text-balance',
							'mt-2'
						)}
					>
						<span className='px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-500'>@darylcecile</span>
					</p> */}
				</div>
				{/* <DotMatrixImage
				src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1601-9yuID5GpoyFr3s9DYcDfmHnjH7CGp3.jpeg"
				width={800}
				height={600}
				dotSize={dotSize}
				dotSpacing={2}
				samplingFactor={3}
				backgroundColor={'transparent'} // Set to null for transparent background
				hoverEffect={true}
				hoverRadius={55}
				hoverScale={1.6}
				hoverBrightness={1}
				hoverSaturation={1.3}
				radialFade={true}
				radialFadeStrength={1}
				radialFadeRadius={0.7}
				radialFadeCurve="exponential"
				animationDuration={300} // Animation duration in milliseconds
			/> */}
			</div>
			<div className={cn(GeistSans.className, "max-w-2xl mx-auto flex flex-col gap-4", 'text-foreground leading-6 tracking-wide text-lg text-center')}>
				<p>
					This portfolio showcases projects I've built for 🧠 learning purposes, some ideas I've 🔭 explored, and my creative journey through various proof-of-concept experiments ✨. My current side-project is <a href="https://knosh.app" target="_blank" rel="noreferrer" className='opacity-80 hover:opacity-100 focus-visible:opacity-100 translate-y-[2px] text-orange-500 inline-flex items-center justify-center'>
						<KnoshLogo height={'0.78em'} width={'auto'} />
					</a>
				</p>

				<p>
					It's all a collection of my curiosity in action — from throwaway projects that taught me something new, to concepts I just <i>had</i> to bring to life. So take a look around, and if you have any thoughts or feedback, I'd love to hear it.
				</p>

				<p className='text-balance'>
					If you want to stay in touch, you can find me on <FancyLink href="https://github.com/darylcecile">GitHub</FancyLink>, <FancyLink href="https://bsky.app/profile/daryl.wtf">BlueSky</FancyLink>, and (reluctantly) <FancyLink href="https://twitter.com/darylcecile">Twitter</FancyLink>.
				</p>
			</div>
		</div>
	)
}

type BadgeProps = PropsWithChildren<{
	emoji: string;
	href?: string;
}>;

function Badge(props: BadgeProps) {
	return (
		<div className='inline-flex items-center gap-1 p-1 bg-orange-200 rounded-full'>
			<span className="rounded-full p-1 aspect-square bg-card text-xs flex items-center justify-center">{props.emoji}</span>
			<span className='pl-0.5 pr-2 text-base'>{props.children}</span>
		</div>
	)
}

