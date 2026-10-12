export function validateGithubHandle(input: unknown): string {
	if (typeof input !== "string" || !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(input)) {
		throw new Error("Invalid GitHub handle.");
	}
	return input;
}

export function validateRepoIdentifier(input: unknown): string {
	if (typeof input !== "string" || input.length > 140) {
		throw new Error("Invalid GitHub repository.");
	}
	const [owner, repo, extra] = input.split("/");
	validateGithubHandle(owner);
	if (extra !== undefined || !repo || !/^[\w.-]{1,100}$/.test(repo) || /^\.{1,2}$/.test(repo)) {
		throw new Error("Invalid GitHub repository.");
	}
	return input;
}

export function validateMetadataUrl(input: unknown): string {
	if (typeof input !== "string" || !input.trim() || input.length > 2048) {
		throw new Error("Invalid preview URL.");
	}
	const url = new URL(input, "https://darylcecile.net");
	if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
		throw new Error("Preview URLs must use HTTP or HTTPS without credentials.");
	}
	const hostname = url.hostname.replace(/\.+$/, "");
	// Preview fetching is public. Local hosts and IP literals aren't site previews.
	if (!hostname.includes(".") || /(?:^|\.)(?:localhost|local)$/.test(hostname)
		|| /^\[|^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
		throw new Error("Preview URLs must refer to a public website.");
	}
	url.hostname = hostname;
	url.hash = "";
	return url.href;
}

export function validateTweetId(input: unknown): string {
	if (typeof input !== "string" || !/^\d{1,40}$/.test(input)) {
		throw new Error("Invalid tweet ID.");
	}
	return input;
}
