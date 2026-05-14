// Schedule + upcoming episode configuration.
//
// Update `nextEpisodeDate` and `nextEpisodeTopic` when an episode is
// booked. The home page and Episodes page use this to render the
// "Next episode" or "Premiere" card.

export const liveConfig = {
  // ISO 8601 string for the next scheduled episode.
  // 2026-05-14 12:00 EDT = 16:00 UTC. Premiere episode.
  nextEpisodeDate: '2026-05-14T16:00:00Z',
  nextEpisodeTopic:
    'Premiere. Andrew and Liz on why we built this show, why it matters, and why now.',
  nextEpisodeGuest: '',
  // Optional eyebrow override. When set, replaces "Next episode" so we
  // can call out a premiere or a special.
  nextEpisodeEyebrow: 'Premiere',
} as const;

export type LiveConfig = typeof liveConfig;
