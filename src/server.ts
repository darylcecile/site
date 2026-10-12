import handler, { createServerEntry } from '@tanstack/react-start/server-entry';

export default createServerEntry({
	fetch(request, options) {
		const url = new URL(request.url);
		if (url.hostname === 'www.darylcecile.net') {
			url.hostname = 'darylcecile.net';
			url.protocol = 'https:';
			return Response.redirect(url, 302);
		}
		return handler.fetch(request, options);
	},
});
