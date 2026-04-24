import { XMLParser } from 'fast-xml-parser';

export interface PodcastEpisode {
  slug: string;
  title: string;
  description: string;
  contentHtml: string;
  pubDate: Date;
  pubDateISO: string;
  duration: string;
  durationSeconds: number;
  episodeNumber: number | null;
  seasonNumber: number | null;
  season: number;
  artwork: string;
  audioUrl: string;
  guid: string;
  guest: string | null;
  transistorEmbedUrl: string | null;
  link: string;
  chapters: Array<{ start: number; title: string }>;
  explicit: boolean;
}

export interface PodcastFeed {
  title: string;
  description: string;
  artwork: string;
  link: string;
  feedUrl: string;
  author: string;
  episodes: PodcastEpisode[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  parseTagValue: false,
  trimValues: true,
});

function text(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if ('__cdata' in v) return String(v.__cdata ?? '').trim();
    if ('#text' in v) return String(v['#text'] ?? '').trim();
  }
  return '';
}

function attr(value: unknown, key: string): string {
  if (value && typeof value === 'object') {
    const v = (value as Record<string, unknown>)[`@_${key}`];
    if (v != null) return String(v);
  }
  return '';
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function parseDuration(raw: string): { formatted: string; seconds: number } {
  if (!raw) return { formatted: '', seconds: 0 };
  // Accept either HH:MM:SS or MM:SS or a bare seconds count.
  if (/^\d+$/.test(raw)) {
    const s = parseInt(raw, 10);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const formatted = hh > 0
      ? `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
      : `${mm}:${String(ss).padStart(2, '0')}`;
    return { formatted, seconds: s };
  }
  const parts = raw.split(':').map((n) => parseInt(n, 10) || 0);
  let seconds = 0;
  if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
  else seconds = parts[0] || 0;
  return { formatted: raw, seconds };
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractGuest(title: string, description: string): string | null {
  // Common patterns: "Ep. 12: Topic with Guest Name" or "Topic with Guest Name"
  const withMatch = title.match(/\bwith\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3})/);
  if (withMatch) return withMatch[1].trim();
  const featMatch = title.match(/\bfeat(?:uring)?\.?\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3})/i);
  if (featMatch) return featMatch[1].trim();
  const guestMatch = description.match(/\bguest(?:\s*:|,)?\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3})/);
  if (guestMatch) return guestMatch[1].trim();
  return null;
}

function normalizeArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function parseChapters(item: Record<string, unknown>): Array<{ start: number; title: string }> {
  const psc = item['psc:chapters'] as Record<string, unknown> | undefined;
  if (!psc) return [];
  const raw = normalizeArray(psc['psc:chapter'] as unknown);
  return raw
    .map((c) => {
      const start = attr(c, 'start');
      const title = attr(c, 'title');
      if (!start || !title) return null;
      const [h = '0', m = '0', s = '0'] = start.split(':');
      const seconds = parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseFloat(s);
      return { start: Math.floor(seconds), title };
    })
    .filter((c): c is { start: number; title: string } => c !== null);
}

function buildTransistorEmbed(audioUrl: string, link: string): string | null {
  // Transistor episodes have an embed URL of the form
  // https://share.transistor.fm/e/<episode-slug>. We try to derive it from
  // the public episode link when it lives on transistor.fm or ghostin...
  // Otherwise return null and the page falls back to an <audio> element.
  try {
    const u = new URL(link);
    if (u.hostname.endsWith('transistor.fm')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last) return `https://share.transistor.fm/e/${last}`;
    }
  } catch {
    // ignore
  }
  // Some Transistor feeds put the embed URL in the enclosure path.
  const match = audioUrl.match(/transistor\.fm\/(?:media\/rss\/)?([^/]+)\//);
  if (match && match[1]) {
    return `https://share.transistor.fm/e/${match[1]}`;
  }
  return null;
}

let cachedFeed: PodcastFeed | null = null;
let cachedAt = 0;

export async function fetchFeed(feedUrl: string, opts: { cacheMs?: number } = {}): Promise<PodcastFeed> {
  const cacheMs = opts.cacheMs ?? 5 * 60 * 1000;
  if (cachedFeed && Date.now() - cachedAt < cacheMs) {
    return cachedFeed;
  }

  let xml = '';
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'GhostInTheMachine/1.0 (+https://ghostinthemachine.studio)' },
    });
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.warn(`[rss] Could not fetch ${feedUrl}: ${(err as Error).message}. Using placeholder feed.`);
    const feed = placeholderFeed();
    cachedFeed = feed;
    cachedAt = Date.now();
    return feed;
  }

  const feed = parseFeedXml(xml);
  cachedFeed = feed;
  cachedAt = Date.now();
  return feed;
}

export function parseFeedXml(xml: string): PodcastFeed {
  const doc = parser.parse(xml) as Record<string, any>;
  const channel = doc?.rss?.channel ?? {};

  const feedArtwork =
    attr(channel['itunes:image'], 'href') ||
    text(channel.image?.url) ||
    '/images/cover-art.png';

  const items = normalizeArray<Record<string, any>>(channel.item);

  const episodes: PodcastEpisode[] = items.map((item) => {
    const title = text(item.title);
    const rawDescription = text(item.description);
    const contentEncoded = text(item['content:encoded']) || rawDescription;
    const description = stripHtml(rawDescription);
    const pubDateRaw = text(item.pubDate);
    const pubDate = pubDateRaw ? new Date(pubDateRaw) : new Date();
    const enclosure = item.enclosure ?? {};
    const audioUrl = attr(enclosure, 'url');
    const link = text(item.link) || audioUrl;
    const artwork = attr(item['itunes:image'], 'href') || feedArtwork;
    const { formatted: duration, seconds: durationSeconds } = parseDuration(
      text(item['itunes:duration'])
    );
    const episodeNumberRaw = text(item['itunes:episode']);
    const seasonNumberRaw = text(item['itunes:season']);
    const episodeNumber = episodeNumberRaw ? parseInt(episodeNumberRaw, 10) : null;
    const seasonNumber = seasonNumberRaw ? parseInt(seasonNumberRaw, 10) : null;
    const guid = text(item.guid) || audioUrl || title;
    const guest = extractGuest(title, description);
    const season = seasonNumber ?? pubDate.getFullYear();

    return {
      slug: slugify(title) || slugify(guid),
      title,
      description,
      contentHtml: contentEncoded,
      pubDate,
      pubDateISO: pubDate.toISOString(),
      duration,
      durationSeconds,
      episodeNumber,
      seasonNumber,
      season,
      artwork,
      audioUrl,
      guid,
      guest,
      transistorEmbedUrl: buildTransistorEmbed(audioUrl, link),
      link,
      chapters: parseChapters(item),
      explicit: /^(yes|true)$/i.test(text(item['itunes:explicit'])),
    };
  });

  episodes.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return {
    title: text(channel.title) || 'Ghost in the Machine',
    description: stripHtml(text(channel.description)),
    artwork: feedArtwork,
    link: text(channel.link) || 'https://ghostinthemachine.studio',
    feedUrl: attr(channel['atom:link'], 'href') || '',
    author: text(channel['itunes:author']) || 'Ghost in the Machine',
    episodes,
  };
}

// Deterministic placeholder used when the feed URL is unreachable (e.g.
// local dev with no network, or before Transistor is set up). Lets every
// page render end-to-end. Replace with the real feed in production.
export function placeholderFeed(): PodcastFeed {
  const episodes: PodcastEpisode[] = [
    {
      title: 'Episode 4: The economics of an agent that never clocks out',
      guest: 'Priya Shah',
      description:
        'Priya Shah spent three years pricing autonomous software agents for a Fortune 500. We ask her what happens to a labor line item when the worker is a subscription.',
      pubDaysAgo: 3,
      duration: '54:12',
      number: 4,
    },
    {
      title: 'Episode 3: The hallucination problem is a documentation problem',
      guest: 'Marcus Whitfield',
      description:
        'Marcus Whitfield runs a legal AI tool that has to be right or it gets you sued. He argues the word "hallucination" is a cop-out for writing better context.',
      pubDaysAgo: 10,
      duration: '48:55',
      number: 3,
    },
    {
      title: 'Episode 2: Is "prompt engineer" a real job in five years?',
      guest: 'Dana Okafor',
      description:
        'Dana Okafor has hired dozens of them. We ask whether the title survives, whether it should, and what a person who writes prompts for a living is actually doing all day.',
      pubDaysAgo: 17,
      duration: '51:04',
      number: 2,
    },
    {
      title: 'Episode 1: The AI optimist and the AI skeptic walk into a podcast',
      guest: null,
      description:
        'Andrew and Liz introduce themselves, lay out the rules of the show, and disagree about almost everything for the next fifty minutes.',
      pubDaysAgo: 24,
      duration: '57:40',
      number: 1,
    },
  ].map((e, i) => {
    const pubDate = new Date(Date.now() - e.pubDaysAgo * 86400000);
    const { formatted: duration, seconds: durationSeconds } = parseDuration(e.duration);
    return {
      slug: slugify(e.title),
      title: e.title,
      description: e.description,
      contentHtml: `<p>${e.description}</p><p>This is placeholder content shown when the live RSS feed cannot be reached. Replace <code>PUBLIC_PODCAST_RSS_URL</code> in your environment with the real Transistor feed URL.</p>`,
      pubDate,
      pubDateISO: pubDate.toISOString(),
      duration,
      durationSeconds,
      episodeNumber: e.number,
      seasonNumber: 1,
      season: pubDate.getFullYear(),
      artwork: '/images/cover-art.svg',
      audioUrl: '',
      guid: `placeholder-${i}`,
      guest: e.guest,
      transistorEmbedUrl: null,
      link: '',
      chapters: [],
      explicit: false,
    };
  });

  return {
    title: 'Ghost in the Machine',
    description: 'A weekly philosophical podcast about AI. One optimist, one skeptic, no hype.',
    artwork: '/images/cover-art.svg',
    link: 'https://ghostinthemachine.studio',
    feedUrl: '',
    author: 'Andrew DeGood and Liz Short',
    episodes,
  };
}

export async function loadFeed(): Promise<PodcastFeed> {
  const url = import.meta.env.PUBLIC_PODCAST_RSS_URL;
  if (!url) {
    console.warn('[rss] PUBLIC_PODCAST_RSS_URL not set, using placeholder feed.');
    return placeholderFeed();
  }
  return fetchFeed(url);
}
