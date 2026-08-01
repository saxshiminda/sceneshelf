import { Link, useParams } from 'react-router-dom'
import {
  useCollectionParts,
  useSimilarTitles,
  useTitleDetails,
} from '../hooks/useMovies'
import { useShelfStatus } from '../hooks/useShelf'
import { posterUrl } from '../api/movies'
import PosterRow from '../components/PosterRow'
import TitleRatings from '../components/TitleRatings'
import {
  displayTitle,
  displayYear,
  type MediaType,
} from '../types/tmdb'

export default function TitlePage() {
  const { mediaType, id } = useParams<{ mediaType: string; id: string }>()
  const type: MediaType | null =
    mediaType === 'movie' || mediaType === 'tv' ? mediaType : null
  const numericId = id ? Number(id) : null
  const validId = numericId !== null && Number.isFinite(numericId) ? numericId : null

  const { data, error, isLoading } = useTitleDetails(type, validId)
  const { status, busy, error: shelfError, toggle, isAuthenticated } = useShelfStatus(
    type,
    validId,
  )

  const collectionId =
    type === 'movie' && data?.belongs_to_collection?.id
      ? data.belongs_to_collection.id
      : null
  const collectionName = data?.belongs_to_collection?.name ?? 'More in this series'

  const { data: collectionParts } = useCollectionParts(collectionId, validId)
  const excludeFromSimilar = [
    ...(validId !== null ? [validId] : []),
    ...(collectionParts ?? []).map((t) => t.id),
  ]
  const { data: similar, isLoading: similarLoading } = useSimilarTitles(
    type,
    validId,
    excludeFromSimilar,
  )

  if (!type || validId === null) {
    return (
      <p className="mx-auto max-w-6xl px-5 py-16 text-fg-muted">
        Invalid title.{' '}
        <Link to="/search" className="text-brass hover:underline">
          Back to search
        </Link>
      </p>
    )
  }

  if (isLoading) {
    return <p className="mx-auto max-w-6xl px-5 py-16 text-fg-muted">Loading…</p>
  }

  if (error || !data) {
    return (
      <p className="mx-auto max-w-6xl px-5 py-16 text-red-400">
        {error?.message ?? 'Title not found'}
      </p>
    )
  }

  const title = displayTitle(data)
  const year = displayYear(data)
  const poster = posterUrl(data.poster_path, 'w500')
  const kind = type === 'tv' ? 'Series' : 'Film'
  const genres = (data.genres ?? []).map((g) => g.name).join(', ')
  const runtime =
    type === 'movie' && data.runtime
      ? `${data.runtime} min`
      : type === 'tv' && data.number_of_seasons
        ? `${data.number_of_seasons} season${data.number_of_seasons === 1 ? '' : 's'}`
        : null

  const meta = [year, genres, runtime].filter(Boolean).join(' · ')
  const hasParts = (collectionParts?.length ?? 0) > 0
  const hasSimilar = (similar?.length ?? 0) > 0

  const shelfMeta = {
    title,
    poster_path: data.poster_path ?? null,
    year,
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
      <div className="grid gap-10 py-10 lg:grid-cols-[280px_1fr] lg:gap-14 lg:py-14">
        <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-lg bg-poster shadow-lg lg:mx-0">
          {poster ? (
            <img src={poster} alt="" className="aspect-[2/3] w-full object-cover" />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center text-fg-muted">
              No poster
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <span className="w-fit rounded border border-border px-2 py-0.5 text-[10px] font-medium tracking-wide text-fg-secondary uppercase">
            {kind}
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight text-fg sm:text-5xl">
            {title}
          </h1>
          {meta && <p className="mt-3 text-sm text-fg-muted">{meta}</p>}

          <TitleRatings score={data.vote_average} votes={data.vote_count} />

          {data.overview && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-secondary">
              {data.overview}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggle('watched', shelfMeta)}
              className={`rounded-md px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                status.watched
                  ? 'bg-brass text-canvas'
                  : 'border border-border bg-elevated/40 text-fg hover:border-brass'
              }`}
            >
              {status.watched ? 'Watched' : 'Mark watched'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggle('want_to_watch', shelfMeta)}
              className={`rounded-md border px-5 py-2.5 text-sm transition disabled:opacity-60 ${
                status.want_to_watch
                  ? 'border-brass bg-brass/15 text-fg'
                  : 'border-border bg-elevated/40 text-fg hover:border-brass'
              }`}
            >
              Want to watch
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggle('favorite', shelfMeta)}
              className={`rounded-md border px-5 py-2.5 text-sm transition disabled:opacity-60 ${
                status.favorite
                  ? 'border-brass bg-brass/15 text-fg'
                  : 'border-border bg-elevated/40 text-fg hover:border-brass'
              }`}
            >
              {status.favorite ? 'Favorited' : 'Favorite'}
            </button>
          </div>
          {!isAuthenticated && (
            <p className="mt-3 text-sm text-fg-muted">
              <Link to="/login" className="text-brass hover:underline">
                Sign in
              </Link>{' '}
              to save titles to your shelf.
            </p>
          )}
          {shelfError && <p className="mt-3 text-sm text-red-400">{shelfError}</p>}
        </div>
      </div>

      {(hasParts || hasSimilar || similarLoading) && (
        <div className="space-y-14 border-t border-border/60 pt-12">
          {hasParts && (
            <PosterRow
              title={collectionName.replace(/\s+Collection$/i, '') || 'More in this series'}
              titles={collectionParts!}
            />
          )}

          {similarLoading && !hasSimilar && (
            <p className="text-sm text-fg-muted">Loading related…</p>
          )}
          {hasSimilar && (
            <PosterRow
              title={type === 'tv' ? 'Related series' : 'Related films'}
              titles={similar!}
            />
          )}
        </div>
      )}
    </div>
  )
}
