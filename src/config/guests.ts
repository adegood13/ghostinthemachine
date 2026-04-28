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

export const guests: Guest[] = [];

export function findGuestByName(name: string | null | undefined): Guest | undefined {
  if (!name) return undefined;
  const needle = name.trim().toLowerCase();
  return guests.find(
    (g) =>
      g.name.toLowerCase() === needle ||
      g.slug === needle.replace(/\s+/g, '-')
  );
}
