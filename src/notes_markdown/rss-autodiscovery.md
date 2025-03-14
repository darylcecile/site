---
title: "Adding RSS Autodiscovery to your site"
date: "2022-06-05"
snippet: A how-to guide on adding RSS to your site
---

Recently, I've discovered a new-found love for <abbr title="Really Simple Syndication" link="https://rss.com/blog/how-do-rss-feeds-work/">RSS</abbr>. It gives
me the best of both worlds; fast access to content, and a way to subscribe to content from sites I frequently visit - without 
having to share my email address. Coincidentally, over the Jubilee weekend, I've been updating my website; adding dark mode,
writing new content, and even adding an RSS feed. So I thought id write a mini tutorial guide on adding autodiscovery to a website.

### Getting started

Firstly, put together an RSS feed. Most frameworks have their own way of implementing this. For my website, I had to do this 
manually by writing a small pre-build script that utilizes the [Feed NPM Package](https://www.npmjs.com/package/feed) to create 
the xml, atom, and json feeds. Once you have a feed and a way to access it (i.e. the link where the feed is hosted), you can 
go ahead with autodiscovery.

Adding auto-discovery is as easy as adding the following snippet into the `<head>` tag of your page:

```html
<link rel="alternate" 
      type="application/rss+xml" 
      title="RSS Feed for darylcecile.net" 
      href="/rss.xml" />
```

Make sure to update the `href` and `title` attributes to match your website content!

If you are using an ATOM feed, you will need to change the `type` attribute value to `application/atom+xml`. This will tell the
feed crawlers that come across your site how to handle the feed you provide.

After enabling autodiscovery, browsers and feed aggregators will be able to automatically detect that your website has a feed, making
it easier for visitors to subscribe to it. My _current_ feed aggregator of choice is currently [feeder](https://feeder.co); It automatically
detects RSS, ATOM, and JSON feeds on pages that I visit, and allows me to subscribe to it with two clicks.