# Ghost in the Machine

The public website for **Ghost in the Machine**, a weekly philosophical podcast about AI hosted by Andrew DeGood and Liz Short. Live on YouTube and LinkedIn every Thursday, published as a podcast on every major platform.

**Production domain:** [ghostinthemachine.studio](https://ghostinthemachine.studio)

---

## What this repo is

A static Astro site that:

- Renders the show's brand identity in dark mode first, with a light mode toggle.
- Parses the Transistor RSS feed at build time and generates a page per episode.
- Embeds the YouTube Live stream when the show is live, or a "next episode" card when it is not.
- Accepts guest submissions and contact messages via Netlify Forms (no third-party form service).
- Captures newsletter signups via an embedded Beehiiv form.
- Ships JSON-LD structured data (`PodcastSeries` and `PodcastEpisode`), per-page Open Graph tags, a sitemap, and a proxy RSS feed at `/feed.xml`.

Framework is **Astro** (latest), styling is **Tailwind CSS** with the brand palette configured as design tokens, and hosting is **Netlify**. The only client-side JavaScript runtime shipped is a tiny Preact island for the episode search input.

---

## Local development

Prerequisites: Node 20+, npm 10+.

```bash
npm install
cp .env.example .env      # fill in real values, see below
npm run dev
```

Dev server: [http://localhost:4321](http://localhost:4321).

Build a production bundle:

```bash
npm run build
npm run preview
```

If the `PUBLIC_PODCAST_RSS_URL` env var is not set, the site renders a deterministic placeholder feed with four sample episodes so every page still works end to end. Swap in the real Transistor feed URL before going to production.

---

## Environment variables

All env vars live in `.env.example`. Copy to `.env` for local work and set them in Netlify (**Site settings → Environment variables**) for production.

| Variable | What it does |
| --- | --- |
| `PUBLIC_PODCAST_RSS_URL` | Transistor RSS feed URL. Parsed at build time. Populates the episode list, the individual episode pages, and `/feed.xml`. |
| `PUBLIC_GA4_ID` | Google Analytics 4 measurement ID (e.g. `G-XXXXXXXXXX`). Leave blank to disable analytics. |
| `PUBLIC_BEEHIIV_EMBED_URL` | Beehiiv inline embed URL for newsletter signup. Grab it from Beehiiv → Settings → Embed. Blank shows a placeholder form with a visible note. |
| `PUBLIC_YOUTUBE_CHANNEL_URL` | Channel link used on the Watch page. |
| `PUBLIC_LINKEDIN_URL` | LinkedIn page link used on the Watch page. |
| `PUBLIC_LIVE_YOUTUBE_VIDEO_ID` | Optional override for the "currently live" YouTube video ID. When set, the home page and Watch page render the live embed. Leaving it blank falls back to `src/config/live.ts`. |

The `PUBLIC_` prefix is required by Astro to expose the value to the client bundle. None of these values are secrets.

---

## Content workflow

### Adding a new episode

Episodes are pulled from the Transistor RSS feed at build time. You do not edit the site to add an episode. The flow is:

1. Publish the episode in Transistor.
2. Trigger a Netlify rebuild (options below).
3. Netlify runs `npm run build`, which re-fetches the feed and generates the new episode page at `/episodes/<slug>`.

**Option A: Transistor webhook into a Netlify build hook (recommended).**

1. In Netlify → **Site settings → Build & deploy → Build hooks**, create a hook called `transistor-new-episode` and copy the URL.
2. In Transistor → **Settings → Integrations → Webhooks** (or the current equivalent), paste the build hook URL and configure it to fire on "Episode published."
3. Done. New episodes trigger a rebuild within a minute of publishing.

**Option B: Scheduled rebuild.** Use Netlify's scheduled build feature or an external scheduler (GitHub Actions cron) to hit the build hook once a day.

**Option C: Manual.** Click **Trigger deploy → Deploy site** in Netlify.

### Going live (when a show is about to start streaming)

Live detection is manual for v1. Two options:

**Quick toggle via env var (no code change required):**

1. In Netlify → **Environment variables**, set `PUBLIC_LIVE_YOUTUBE_VIDEO_ID` to the live YouTube video ID.
2. Trigger a deploy. The home page and Watch page render the live embed.
3. When the stream ends, clear the env var and redeploy.

**Committed toggle:**

1. Edit `src/config/live.ts`. Set `isLive: true` and `youtubeVideoId: '<id>'`.
2. Update `nextEpisodeDate` and `nextEpisodeTopic` for the next show.
3. Commit, push. Netlify redeploys automatically.

A future enhancement could query the YouTube Data API to flip this on automatically. Not in v1.

### Updating host bios, the palette, or platform links (for non-developers)

The content that people most commonly want to update is centralized in a few small files. No framework knowledge required.

- **Host bios and roles** → `src/config/site.ts`, the `hosts` array.
- **Show tagline and description** → `src/config/site.ts`, `tagline` and `description`.
- **Podcast platform links** → `src/config/site.ts`, the `platforms` array. URLs marked `REPLACE_ME` need real URLs after Apple/Spotify/Amazon approve the feed.
- **Live schedule copy** → `src/config/site.ts`, the `schedule` object.
- **Editorial principles on the About page** → `src/config/site.ts`, `editorialPrinciples`.
- **Guest directory** → `src/config/guests.ts`. Append a new entry per guest.
- **Social links and contact email** → `src/config/site.ts`, `social`.

After editing, commit and push. Netlify redeploys automatically.

### Updating brand assets

- **Logo** → `public/favicon.svg` (the tiny square) and the `<span>GM</span>` block inside `src/components/Header.astro` and `src/components/Footer.astro`. Replace the placeholder with the real logo file when available. Keep the SVG aspect ratio square.
- **Cover art** → `public/images/cover-art.svg`. Replace with the real cover art (1600x1600 PNG or JPG recommended). Update the file extension in `src/lib/rss.ts` (the `placeholderFeed` fallback path) if you change it from `.svg`.
- **Open Graph default image** → `public/images/og-default.svg`. Swap with a real 1200x630 PNG for better link previews.
- **Host headshots** → drop JPGs at `public/images/hosts/andrew.jpg` and `public/images/hosts/liz.jpg`, then update the `image` paths in `src/config/site.ts`.
- **Guest headshots** → drop images in `public/images/guests/<slug>.jpg` and set `image` in the guest's entry in `src/config/guests.ts`.
- **Colors** → `tailwind.config.mjs` defines the brand palette. The four brand colors (Signal Black, Ghost White, Static Teal, Circuit Silver) are the entire palette. Do not add more.
- **Fonts** → Inter is loaded from `rsms.me/inter/inter.css` with `font-display: swap`. To self-host, drop the woff2 files into `public/fonts/` and uncomment the `@font-face` block in `src/styles/global.css`.

---

## Deploying to Netlify

1. Push the repo to GitHub.
2. In Netlify: **Add new site → Import an existing project** and pick this repo. The build command (`npm run build`) and publish directory (`dist`) are already declared in `netlify.toml`.
3. Under **Site settings → Environment variables**, set every `PUBLIC_*` value from `.env.example`.
4. **Domain management → Add a custom domain → `ghostinthemachine.studio`.** Netlify will show the DNS records to point at. In Squarespace (the domain registrar), add the A record and the CNAME records Netlify requests. Wait for DNS to propagate and for Netlify to issue the Let's Encrypt certificate.
5. **Build & deploy → Build hooks → Add build hook.** Name it `transistor-new-episode`. Copy the URL.
6. In Transistor, add that URL as a webhook that fires on episode publish.
7. **Forms tab.** Netlify auto-detects the two forms (`guest-submission` and `contact`) from the static HTML on first deploy. Configure notification emails in Netlify → **Forms → Settings**.

The repo's `netlify.toml` also sets security headers, a long cache for built assets, and a few nice-to-have redirects (`/rss` → `/feed.xml`, `/podcast` → `/listen`, `/subscribe` → `/listen`).

---

## Architecture notes

### Tech stack (locked)

- **Astro** for static site generation.
- **Tailwind CSS** with brand colors as first-class theme tokens (`signal-black`, `ghost-white`, `static-teal`, `circuit-silver`).
- **Preact** only for the episode search input (small island, ships ~4KB gzipped of runtime).
- **fast-xml-parser** for RSS ingestion.
- **Netlify Forms** for submissions (no third party).

### Directory layout

```
src/
  components/    Reusable Astro components + the Preact search island
  config/        Site config, live config, guest directory
  layouts/       BaseLayout with SEO, OG, JSON-LD, theme script
  lib/           RSS parsing
  pages/         One file per route
  styles/        global.css (Tailwind layers + component utilities)
public/
  images/        Logo, cover art, host and guest placeholders, OG image
  robots.txt
  favicon.svg
```

### RSS parsing

`src/lib/rss.ts` fetches the Transistor feed at build time, normalizes it into a `PodcastEpisode` type, and caches the result for the duration of the build. If the feed fetch fails or the env var is unset, a deterministic placeholder feed is returned so the site still renders during local dev.

The parser handles:

- iTunes namespace (`itunes:duration`, `itunes:episode`, `itunes:season`, `itunes:image`, `itunes:author`, `itunes:explicit`).
- `content:encoded` for rich show notes (falls back to `description`).
- Podcasting 2.0 chapters (`psc:chapters`).
- Transistor embed URL extraction (falls back to a plain `<audio>` element if no embed can be derived).

### Theme toggle

Dark is the default. The toggle writes to `localStorage` under `gitm-theme` and an inline script in `BaseLayout.astro` applies the saved class before first paint to avoid a flash.

### Forms

Both forms use Netlify's static form detection. The form tags include `data-netlify="true"`, a honeypot field (`bot-field`), and a hidden `form-name` input so Netlify can route the submission. Confirmation pages live at `/submit/thanks` and `/contact/thanks`.

### SEO and structured data

- `BaseLayout` renders per-page `<title>`, `<meta name="description">`, canonical URL, full Open Graph and Twitter card tags, and optional JSON-LD.
- The home page emits a `PodcastSeries` schema.
- Each episode page emits a `PodcastEpisode` schema.
- `/feed.xml` proxies the upstream Transistor feed (preserving signed tracking URLs) and falls back to a synthesized feed if upstream is unreachable.
- `/sitemap-index.xml` is generated by `@astrojs/sitemap`.
- `/robots.txt` allows all crawlers and points at the sitemap.

### Accessibility

- Skip-to-content link on every page.
- Semantic HTML throughout.
- Visible focus ring on every focusable element (see `:focus-visible` in `global.css`).
- All images carry alt text. Decorative images use empty alt.
- Proper heading hierarchy per page (one `<h1>`, descendants below).
- Color contrast meets WCAG 2.1 AA for the four-color palette on primary surfaces in dark mode; verify with a contrast checker whenever you introduce new type sizes or overlays.

---

## What is intentionally not in v1

Documented so nobody accidentally invents them later:

- No user accounts or login.
- No comments on episodes.
- No paid subscriptions or member-only content.
- No CMS. The only content store is the RSS feed (for episodes) and markdown-or-TS files in the repo (for static content like host bios).
- No automated YouTube Live detection. Manual toggle for now.
- No multi-language support.

---

## Voice and style rules for any copy you write into the site

These come from the Brand Foundation and they apply everywhere:

- No em dashes. Use commas, periods, or parentheses.
- No hashtags in body copy.
- No AI-flavored transition phrases ("in today's rapidly evolving landscape," "as we navigate the complexities of," and friends).
- Direct, confident, opinionated. The show has a point of view; the site reflects it.
- Conversational but not casual. Smart, plain English.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Astro dev server. |
| `npm run build` | Build the static site into `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run astro -- <cmd>` | Pass through to the Astro CLI. |

---

## License

Site code is MIT-licensed. Podcast audio, artwork, and show branding are the property of **Ghost in the Machine** and are not covered by that license.
