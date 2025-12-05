import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { ExternalLink, Github } from "lucide-react"
import { cacheLife, cacheTag } from "next/cache"
import { type PropsWithChildren, cache } from "react"
import { GithubActivityHeatmap } from "../ui/githubActivity"

interface GitHubUserProps {
	handle: string
	variant?: "default" | "heatmap"
}

interface GitHubProfile {
	login: string
	name: string
	avatar_url: string
	bio: string
	followers: number
	following: number
	public_repos: number
	html_url: string
	site_admin: boolean
	location?: string
	created_at: string
}

const myGithubProfileFallback = {
	"login": "darylcecile",
	"id": 6310278,
	"node_id": "MDQ6VXNlcjYzMTAyNzg=",
	"avatar_url": "https://avatars.githubusercontent.com/u/6310278?v=4",
	"gravatar_id": "",
	"url": "https://api.github.com/users/darylcecile",
	"html_url": "https://github.com/darylcecile",
	"followers_url": "https://api.github.com/users/darylcecile/followers",
	"following_url": "https://api.github.com/users/darylcecile/following{/other_user}",
	"gists_url": "https://api.github.com/users/darylcecile/gists{/gist_id}",
	"starred_url": "https://api.github.com/users/darylcecile/starred{/owner}{/repo}",
	"subscriptions_url": "https://api.github.com/users/darylcecile/subscriptions",
	"organizations_url": "https://api.github.com/users/darylcecile/orgs",
	"repos_url": "https://api.github.com/users/darylcecile/repos",
	"events_url": "https://api.github.com/users/darylcecile/events{/privacy}",
	"received_events_url": "https://api.github.com/users/darylcecile/received_events",
	"type": "User",
	"user_view_type": "public",
	"site_admin": true,
	"name": "Daryl",
	"company": null,
	"blog": "https://darylcecile.net",
	"location": null,
	"email": null,
	"hireable": null,
	"bio": null,
	"twitter_username": "darylcecile",
	"public_repos": 70,
	"public_gists": 1,
	"followers": 8,
	"following": 18,
	"created_at": "2014-01-03T10:22:48Z",
	"updated_at": "2025-03-11T21:36:36Z"
}

const getUser = cache(async (handle: string) => {
	"use cache";

	cacheTag(`github-user-${handle}`);
	cacheLife('weeks')

	const response = await fetch(`https://api.github.com/users/${handle}`);

	if (!response.ok) {
		if (handle === "darylcecile") {
			return myGithubProfileFallback as GitHubProfile
		}

		if (process.env.NODE_ENV === 'production') throw new Error(`Failed to fetch GitHub profile: ${response.statusText}`)
	}

	const profile = await response.json() as GitHubProfile

	return profile;
})

export async function GitHubUser({ handle, children, variant }: PropsWithChildren<GitHubUserProps>) {
	const profile = await getUser(handle);

	const joinDate = profile?.created_at
		? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(profile.created_at))
		: null

	return (
		<HoverCard>
			<HoverCardTrigger asChild >
				{children}
			</HoverCardTrigger>
			<HoverCardContent
				className={cn(
					"w-80 p-0 overflow-hidden border-none shadow-lg rounded-2xl",
					"bg-muted/80 backdrop-blur-2xl backdrop-saturate-150",
					{
						"bg-transparent shadow-none overflow-visible": variant === 'heatmap',
					}
				)}
				align="center"
				sideOffset={5}
			>
				{variant === 'heatmap' ? (
					<GithubActivityHeatmap username={handle} className="bg-white"/>
				) : (
					<div className="overflow-hidden ">
						<div className="h-24 aspect-4/1 bg-neutral-400 dark:bg-neutral-700 relative overflow-hidden -z-1">
							{/* <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
						<path d="M0,50 C100,20 200,80 400,50 L400,100 L0,100 Z" fill="#1a2d4c" fillOpacity="0.4" />
						<path d="M0,60 C150,30 250,90 400,60 L400,100 L0,100 Z" fill="#2a3d5c" fillOpacity="0.2" />
					</svg> */}
							<img
								src={profile.avatar_url || "/placeholder.svg"}
								alt=""
								className="absolute inset-0 h-full w-full object-cover opacity-100 saturate-150 blur-2xl"
							/>
						</div>
						<div className="px-6 pb-6">
							<div className="flex flex-col items-center -mt-12 mb-4">
								<img
									src={profile.avatar_url || "/placeholder.svg"}
									alt={`${profile.name || profile.login}'s GitHub avatar`}
									className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-950 shadow-2xl mb-3 contain-paint"
								/>
								<div className="text-center">
									<h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
										{profile.name || profile.login}
									</h3>
									<p className="text-gray-500 dark:text-gray-400 text-sm mb-1 flex text-center justify-center items-center gap-1">
										<span className="">@{profile.login}</span>
										{profile.site_admin && (
											<Badge className="mt-0 bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-200 border-none uppercase text-[0.5rem] px-1 pb-px">
												Staff
											</Badge>
										)}
									</p>

								</div>
							</div>

							{(profile.location || joinDate) && (
								<div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
									{joinDate && <span className="text-xs">Joined {joinDate}</span>}
									{profile.location && joinDate && <span className="text-xs">•</span>}
									{profile.location && <span className="text-xs">{profile.location}</span>}
								</div>
							)}

							{profile.bio && (
								<p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">{profile.bio}</p>
							)}

							<div className="flex justify-center gap-6 text-sm">
								<div className="text-center">
									<div className="font-semibold text-gray-900 dark:text-white">
										{profile.followers?.toLocaleString()}
									</div>
									<div className="text-gray-500 dark:text-gray-400 text-xs">Followers</div>
								</div>
								<div className="text-center">
									<div className="font-semibold text-gray-900 dark:text-white">
										{profile.following?.toLocaleString()}
									</div>
									<div className="text-gray-500 dark:text-gray-400 text-xs">Following</div>
								</div>
								<div className="text-center">
									<div className="font-semibold text-gray-900 dark:text-white">
										{profile.public_repos?.toLocaleString()}
									</div>
									<div className="text-gray-500 dark:text-gray-400 text-xs">Repos</div>
								</div>
							</div>

							<div className="mt-5 text-center">
								<a
									href={profile.html_url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
								>
									View on GitHub
									<ExternalLink className="w-3 h-3 ml-0.5" />
								</a>
							</div>
						</div>
					</div>
				)}
			</HoverCardContent>
		</HoverCard>
	)
}

