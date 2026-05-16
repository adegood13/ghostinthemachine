// Private guest booking page configuration.
//
// The page at /guest-booking is gated by a shared password and embeds an
// external scheduling tool (Cal.com, Calendly, or similar). It is hidden
// from the nav, the footer, the sitemap, and search engines.

// The scheduling tool's public booking URL. Hardcoded as the default so
// the page works without an env var; PUBLIC_BOOKING_URL still overrides it
// (useful for pointing a preview deploy at a test event).
const DEFAULT_BOOKING_URL =
  'https://calendly.com/d/cvp7-wmv-zkb/ghost-in-the-machine';

export const bookingUrl =
  import.meta.env.PUBLIC_BOOKING_URL || DEFAULT_BOOKING_URL;

// SHA-256 hash of the shared access password. The gate hashes whatever the
// visitor types and compares against this. The plaintext password is never
// stored in the site source.
//
// Current password: gitm-guest-2026
// To change it: run
//   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex'))"
// and paste the result below.
export const bookingPasswordHash =
  '0daad77a2ed3b2079dae6a0dfbbf4a3df35e2e94a65fcce9c1eaec577562a814';

// Short instructions shown above the scheduler once the page is unlocked.
export const bookingIntro = {
  eyebrow: 'Guest booking',
  heading: 'Book your recording date.',
  blurb:
    'Thanks for joining us on Ghost in the Machine. Pick an open date and choose a topic below. Once you confirm, a calendar invite goes out to you and to Liz, and you are on the schedule. Questions before you book? Email hello@ghostinthemachine.studio.',
};
