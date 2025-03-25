
/**
 * create an HTML id-safe string from the text
 */
export function generateIdFromText(text: string) {

	const id = text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/--+/g, '-');
	return id;
}