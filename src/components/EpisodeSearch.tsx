import { useMemo, useState } from 'preact/hooks';

interface EpisodeLite {
  slug: string;
  title: string;
  description: string;
  guest: string | null;
  artwork: string;
  pubDateISO: string;
  duration: string;
  episodeNumber: number | null;
  season: number;
}

interface Props {
  episodes: EpisodeLite[];
}

export default function EpisodeSearch({ episodes }: Props) {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState<'all' | number>('all');

  const seasons = useMemo(() => {
    const set = new Set<number>();
    episodes.forEach((e) => set.add(e.season));
    return Array.from(set).sort((a, b) => b - a);
  }, [episodes]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return episodes.filter((e) => {
      if (season !== 'all' && e.season !== season) return false;
      if (!needle) return true;
      return (
        e.title.toLowerCase().includes(needle) ||
        (e.guest ?? '').toLowerCase().includes(needle) ||
        e.description.toLowerCase().includes(needle)
      );
    });
  }, [episodes, query, season]);

  return (
    <div>
      <div class="flex flex-col sm:flex-row gap-3 mb-8">
        <label class="flex-1">
          <span class="sr-only">Search episodes</span>
          <input
            type="search"
            value={query}
            onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
            placeholder="Search by title, guest, or topic"
            class="w-full bg-transparent border border-ghost-white/20 px-4 py-3 text-base placeholder:text-circuit-silver focus:border-static-teal focus:outline-none"
            aria-label="Search episodes"
          />
        </label>
        {seasons.length > 1 && (
          <label class="sm:w-48">
            <span class="sr-only">Filter by season</span>
            <select
              value={String(season)}
              onChange={(e) => {
                const val = (e.currentTarget as HTMLSelectElement).value;
                setSeason(val === 'all' ? 'all' : parseInt(val, 10));
              }}
              class="w-full bg-signal-black border border-ghost-white/20 px-4 py-3 text-base focus:border-static-teal focus:outline-none"
              aria-label="Filter by season"
            >
              <option value="all">All seasons</option>
              {seasons.map((s) => (
                <option value={String(s)}>Season {s}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <p class="text-sm text-circuit-silver mb-6" aria-live="polite">
        Showing {filtered.length} of {episodes.length} episodes
      </p>

      <ul class="grid gap-4">
        {filtered.map((e) => {
          const date = new Date(e.pubDateISO).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          return (
            <li class="card p-5 hover:border-static-teal/60" key={e.slug}>
              <a href={`/episodes/${e.slug}`} class="block group">
                <div class="grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr] gap-6">
                  <div class="aspect-square overflow-hidden">
                    <img src={e.artwork} alt="" loading="lazy" class="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-circuit-silver">
                      {e.episodeNumber != null && (
                        <span class="eyebrow">Ep. {e.episodeNumber}</span>
                      )}
                      <span>{date}</span>
                      {e.duration && <span>· {e.duration}</span>}
                    </div>
                    <h3 class="mt-2 font-display font-extrabold tracking-tight text-lg text-ghost-white group-hover:text-static-teal transition-colors">
                      {e.title}
                    </h3>
                    {e.guest && (
                      <p class="mt-1 text-sm text-circuit-silver">
                        with <span class="text-ghost-white">{e.guest}</span>
                      </p>
                    )}
                    <p class="mt-2 text-sm text-ghost-white/80 line-clamp-2">{e.description}</p>
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div class="card p-8 text-center text-circuit-silver">
          No episodes match that search. Try a different term.
        </div>
      )}
    </div>
  );
}
