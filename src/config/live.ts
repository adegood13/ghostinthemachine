// Live stream configuration.
//
// This is a manual toggle for v1. Flip `isLive` to true and set a real
// `youtubeVideoId` before going on air, commit, and let Netlify redeploy.
// A future enhancement could query the YouTube Data API to detect live
// status automatically and avoid the manual step.
//
// The `PUBLIC_LIVE_YOUTUBE_VIDEO_ID` env var overrides `youtubeVideoId`
// if set, so you can flip a switch in Netlify without a code change.

const envVideoId = import.meta.env.PUBLIC_LIVE_YOUTUBE_VIDEO_ID ?? '';

export const liveConfig = {
  isLive: Boolean(envVideoId), // flip manually, or rely on the env var
  youtubeVideoId: envVideoId, // populate when live
  // ISO 8601 string for the next scheduled episode. Update when a show
  // is booked; the home page and Watch page use it to render the
  // "Next episode" card when not live.
  // 2026-05-14 12:00 EDT = 16:00 UTC. Premiere episode.
  nextEpisodeDate: '2026-05-14T16:00:00Z',
  nextEpisodeTopic:
    'Premiere. Andrew and Liz on why we built this show, why it matters, and why now.',
  nextEpisodeGuest: '',
  // Optional eyebrow override. When set, the LiveIndicator uses this in
  // place of "Next episode" so we can call out the premiere or a special.
  nextEpisodeEyebrow: 'Premiere',
} as const;

export type LiveConfig = typeof liveConfig;
