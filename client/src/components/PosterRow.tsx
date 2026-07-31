import { Link } from 'react-router-dom'
import MovieCard from './MovieCard'
import type { TitleCard } from '../types/tmdb'

interface PosterRowProps {
  title: string
  titles: TitleCard[]
  seeAllHref?: string
}

export default function PosterRow({ title, titles, seeAllHref }: PosterRowProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl text-fg sm:text-[1.65rem]">{title}</h2>
        {seeAllHref && (
          <Link
            to={seeAllHref}
            className="shrink-0 text-sm text-fg-secondary transition hover:text-brass"
          >
            See all
          </Link>
        )}
      </div>
      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
        {titles.map((t) => (
          <MovieCard
            key={`${t.mediaType}-${t.id}`}
            title={t}
            className="w-[140px] shrink-0 sm:w-[156px]"
          />
        ))}
      </div>
    </section>
  )
}
