import { Link } from 'react-router-dom'
import { posterUrl } from '../api/movies'
import type { Genre, TitleCard } from '../types/tmdb'

interface ResultRowProps {
  title: TitleCard
  genres?: Genre[]
}

export default function ResultRow({ title, genres = [] }: ResultRowProps) {
  const poster = posterUrl(title.posterPath, 'w342')
  const kind = title.mediaType === 'tv' ? 'Series' : 'Film'
  const genreNames = title.genreIds
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')

  return (
    <article className="flex gap-4 border-b border-border py-5 first:pt-0 last:border-0">
      <Link
        to={`/title/${title.mediaType}/${title.id}`}
        className="shrink-0 overflow-hidden rounded-md bg-poster"
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="h-[120px] w-[80px] object-cover sm:h-[140px] sm:w-[94px]"
          />
        ) : (
          <div className="flex h-[120px] w-[80px] items-center justify-center text-[10px] text-fg-muted sm:h-[140px] sm:w-[94px]">
            No art
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/title/${title.mediaType}/${title.id}`}
            className="font-display text-lg text-fg hover:text-brass sm:text-xl"
          >
            {title.title}
          </Link>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-fg-secondary uppercase">
            {kind}
          </span>
        </div>
        <p className="mt-1 text-sm text-fg-muted">
          {[title.year, genreNames].filter(Boolean).join(' · ')}
          {title.voteAverage > 0 && (
            <>
              {' · '}
              <span className="text-brass">★ {title.voteAverage.toFixed(1)}</span>
            </>
          )}
        </p>
        {title.overview && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-secondary">
            {title.overview}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionChip label="Watched" />
          <ActionChip label="Want to watch" />
          <ActionChip label="Favorite" />
        </div>
      </div>
    </article>
  )
}

function ActionChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-full border border-border bg-elevated/40 px-3 py-1 text-xs text-fg-secondary transition hover:border-brass hover:text-brass"
    >
      {label}
    </button>
  )
}
