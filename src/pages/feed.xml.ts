import type { APIRoute } from 'astro';
import { loadFeed, DEFAULT_PODCAST_RSS_URL } from '@/lib/rss';
import { siteConfig } from '@/config/site';

// Re-expose the Transistor RSS feed at /feed.xml so the canonical feed URL
// lives on ghostinthemachine.studio. If the upstream feed is reachable we
// return it verbatim (to preserve signed tracking URLs and enclosures).
// Otherwise we synthesize a minimal feed from the parsed data.
export const GET: APIRoute = async () => {
  const upstreamUrl = import.meta.env.PUBLIC_PODCAST_RSS_URL || DEFAULT_PODCAST_RSS_URL;

  if (upstreamUrl) {
    try {
      const res = await fetch(upstreamUrl);
      if (res.ok) {
        const xml = await res.text();
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1800',
          },
        });
      }
    } catch {
      // fall through to synthesized feed
    }
  }

  const feed = await loadFeed();
  const items = feed.episodes
    .map((ep) => {
      const link = new URL(`/episodes/${ep.slug}`, siteConfig.url).toString();
      return `
    <item>
      <title><![CDATA[${ep.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="false">${ep.guid}</guid>
      <pubDate>${ep.pubDate.toUTCString()}</pubDate>
      <description><![CDATA[${ep.description}]]></description>
      ${ep.audioUrl ? `<enclosure url="${ep.audioUrl}" type="audio/mpeg" />` : ''}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${feed.title}</title>
    <link>${siteConfig.url}</link>
    <description><![CDATA[${feed.description}]]></description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
};
