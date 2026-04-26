export const siteConfig = {
  name: 'Ghost in the Machine',
  tagline: 'The AI conversation, without the noise.',
  description:
    'A weekly philosophical podcast about artificial intelligence. Andrew DeGood and Liz Short, one optimist and one skeptic, talk honestly about what AI is doing to work, thought, and the humans in the loop.',
  shortDescription:
    'A weekly philosophical podcast about AI. One optimist, one skeptic, no hype.',
  url: 'https://ghostinthemachine.studio',
  hosts: [
    {
      name: 'Andrew DeGood',
      role: 'Host, the optimist',
      company: 'Founder, AskBobAI',
      bioShort:
        'Andrew is the founder of AskBobAI and the optimist on the show. He believes the interesting work is figuring out how AI makes people better at the jobs they already do.',
      bioLong:
        'Andrew DeGood is the founder of AskBobAI, where he builds AI tools for small businesses that have been priced out of enterprise software. He spends his weeks talking to operators about what actually works and what is marketing. On the show, he plays the AI optimist, not because he thinks every tool ships, but because he thinks the downside of refusing to engage is worse than the downside of trying and failing.',
      image: '/images/hosts/andrew.jpg',
      links: {
        linkedin: 'https://www.linkedin.com/in/andrewdegood',
        website: 'https://www.askbobai.com',
      },
    },
    {
      name: 'Liz Short',
      role: 'Host, the skeptic',
      company: 'CEO, Short Solutions',
      bioShort:
        'Liz is the CEO of Short Solutions and the skeptic on the show. She is not anti-AI. She is anti-everyone-pretending-this-is-fine.',
      bioLong:
        'Liz Short is the CEO of Short Solutions, a consultancy that helps mid-market companies actually ship the operational changes they keep trying to ship. She has spent the last decade watching enterprise software promise transformation and deliver slightly faster spreadsheets. On the show, she is the resident skeptic, not because she hates the technology, but because she thinks the people selling it are several steps ahead of the people buying it.',
      image: '/images/hosts/liz.jpg',
      links: {
        linkedin: 'https://www.linkedin.com/in/thelizshort/',
        website: 'https://www.theshortsolution.com/',
      },
    },
  ],
  editorialPrinciples: [
    {
      title: 'No hype, no fear',
      body: 'We do not sell the future and we do not mourn it. We ask what is actually happening, right now, in the room.',
    },
    {
      title: 'One optimist, one skeptic',
      body: 'Every episode runs through two lenses. We disagree on air. Guests get pressed by both sides.',
    },
    {
      title: 'Specifics over abstractions',
      body: 'We trade vague buzzwords for concrete examples. If a claim cannot survive a real example, it does not belong on the show.',
    },
    {
      title: 'Humans are the subject',
      body: 'AI is the vehicle. The show is about the people using it, building it, working around it, and paying for it.',
    },
  ],
  schedule: {
    liveDay: 'Thursday',
    liveTime: '12:00 PM ET',
  },
  platforms: [
    { name: 'Apple Podcasts', url: 'https://podcasts.apple.com/', icon: 'apple' },
    { name: 'Spotify', url: 'https://open.spotify.com/show/REPLACE_ME', icon: 'spotify' },
    { name: 'Amazon Music', url: 'https://music.amazon.com/podcasts/REPLACE_ME', icon: 'amazon' },
    { name: 'Overcast', url: 'https://overcast.fm/itunes-REPLACE_ME', icon: 'overcast' },
    { name: 'Pocket Casts', url: 'https://pca.st/REPLACE_ME', icon: 'pocketcasts' },
    { name: 'YouTube', url: 'https://www.youtube.com/@Ghostinthemachine-c5v', icon: 'youtube' },
    { name: 'RSS Feed', url: '/feed.xml', icon: 'rss' },
  ],
  social: {
    youtube: 'https://www.youtube.com/@Ghostinthemachine-c5v',
    linkedin: 'https://www.linkedin.com/company/ghose-in-the-machine/',
    instagram: 'https://www.instagram.com/ghostinthemachinepodcast/',
    email: 'hello@ghostinthemachine.studio',
  },
  newsletter: {
    heading: 'Get the takeaway in your inbox',
    blurb:
      'One email per episode. The argument, the strongest pushback, and one thing worth your attention this week. No promos. Unsubscribe anytime.',
  },
  legal: {
    copyrightHolder: 'Ghost in the Machine',
  },
} as const;

export type SiteConfig = typeof siteConfig;
