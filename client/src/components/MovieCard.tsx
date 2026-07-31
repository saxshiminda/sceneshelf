import { Link } from 'react-router-dom'
import { posterUrl } from '../api/movies'
import type { TitleCard } from '../types/tmdb'

interface MovieCardProps {
  title: TitleCard
  className?: string
}

export default function MovieCard({ title, className = '' }: MovieCardProps) {
  const poster = posterUrl(title.posterPath)
  const kind = title.mediaType === 'tv' ? 'Series' : 'Film'

  return (
    <Link
      to={`/title/${title.mediaType}/${title.id}`}
      className={`group flex flex-col gap-2.5 ${className}`}
    >
      <div className="overflow-hidden rounded-md bg-poster transition duration-300 group-hover:-translate-y-0.5">
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="aspect-[2/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[2/3] w-full items-center justify-center text-xs text-fg-muted">
            No art
          </div>
        )}
      </div>
      <div>
        <h3
          title={title.title}
          className="truncate text-sm font-medium text-fg group-hover:text-brass"
        >
          {title.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-fg-muted">
          {title.year ?? '—'} · {kind}
          {title.voteAverage > 0 && (
            <span className="text-brass"> · ★ {title.voteAverage.toFixed(1)}</span>
          )}
        </p>
      </div>
    </Link>
  )
}
