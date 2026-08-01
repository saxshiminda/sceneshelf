import { Link } from 'react-router-dom'
import { posterUrl } from '../api/movies'
import type { ShelfFlag, ShelfFlags } from '../api/shelf'
import type { Genre, TitleCard } from '../types/tmdb'

interface ResultRowProps {
  title: TitleCard
  genres?: Genre[]
  status?: ShelfFlags
  busy?: boolean
  canEdit?: boolean
  onToggle?: (flag: ShelfFlag) => void
}

export default function ResultRow({
  title,
  genres = [],
  status,
  busy,
  canEdit,
  onToggle,
}: ResultRowProps) {
  const poster = posterUrl(title.posterPath, 'w342')
  const kind = title.mediaType === 'tv' ? 'Series' : 'Film'
  const genreNames = title.genreIds
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')

  const flags = status ?? { watched: false, want_to_watch: false, favorite: false }

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
        {canEdit && onToggle && (
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionChip
              label="Watched"
              active={flags.watched}
              disabled={busy}
              onClick={() => onToggle('watched')}
            />
            <ActionChip
              label="Want to watch"
              active={flags.want_to_watch}
              disabled={busy}
              onClick={() => onToggle('want_to_watch')}
            />
            <ActionChip
              label="Favorite"
              active={flags.favorite}
              disabled={busy}
              onClick={() => onToggle('favorite')}
            />
          </div>
        )}
      </div>
    </article>
  )
}

function ActionChip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition disabled:opacity-50 ${
        active
          ? 'border-brass bg-brass/15 text-brass'
          : 'border-border bg-elevated/40 text-fg-secondary hover:border-brass hover:text-brass'
      }`}
    >
      {label}
    </button>
  )
}
