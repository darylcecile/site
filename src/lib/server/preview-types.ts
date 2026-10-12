export type GitHubProfile = {
	login: string;
	name: string | null;
	avatar_url: string;
	bio: string | null;
	followers: number;
	following: number;
	public_repos: number;
	html_url: string;
	site_admin: boolean;
	location: string | null;
	created_at: string;
};

export type LinkMetadata = {
	title?: string;
	favicon?: string;
	image?: string;
	description?: string;
};
