// Curated guest directory. Episode attribution comes from matching
// `episodeGuids` against the RSS feed, but guests can also be linked by
// name (which is how the RSS parser auto-fills the guest for an episode).
//
// To add a guest, append a new entry. No build-side logic is needed. If
// a guest appears on the show but is not in this list, their name still
// shows up on the episode page via the RSS-extracted guest field.

export interface Guest {
  slug: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  image?: string;
  links: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    other?: { label: string; url: string };
  };
  episodeGuids?: string[];
}

export const guests: Guest[] = [
  {
    slug: 'priya-shah',
    name: 'Priya Shah',
    title: 'Head of AI Strategy',
    company: 'Northwind Labs',
    bio: 'Priya Shah leads AI strategy at Northwind Labs, where she spent three years pricing autonomous software agents for Fortune 500 clients. She writes about the economics of machine labor.',
    image: '/images/guests/placeholder.svg',
    links: {
      linkedin: 'https://www.linkedin.com/in/priyashah',
      website: 'https://northwindlabs.example',
    },
  },
  {
    slug: 'marcus-whitfield',
    name: 'Marcus Whitfield',
    title: 'Founder and CEO',
    company: 'Brief.ai',
    bio: 'Marcus Whitfield founded Brief.ai, a legal research tool used by AmLaw 100 firms. He is one of the loudest critics of the word "hallucination" in AI discourse.',
    image: '/images/guests/placeholder.svg',
    links: {
      linkedin: 'https://www.linkedin.com/in/marcuswhitfield',
      website: 'https://brief.ai',
    },
  },
  {
    slug: 'dana-okafor',
    name: 'Dana Okafor',
    title: 'VP of Engineering',
    company: 'Loopline',
    bio: 'Dana Okafor is VP of Engineering at Loopline and has hired more prompt engineers than almost anyone in the industry. She has opinions about whether the title survives.',
    image: '/images/guests/placeholder.svg',
    links: {
      linkedin: 'https://www.linkedin.com/in/danaokafor',
    },
  },
];

export function findGuestByName(name: string | null | undefined): Guest | undefined {
  if (!name) return undefined;
  const needle = name.trim().toLowerCase();
  return guests.find(
    (g) =>
      g.name.toLowerCase() === needle ||
      g.slug === needle.replace(/\s+/g, '-')
  );
}
