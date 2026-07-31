import type { Genre, MediaType } from '../types/tmdb'
import FilterPill, { useCloseFilterPill } from './FilterPill'

export type MediaFilter = 'all' | MediaType

export interface SearchFilterValues {
  type: MediaFilter
  genreIds: number[]
  yearFrom: string
  yearTo: string
  minRating: string
  sort: string
}

interface SearchFiltersProps {
  values: SearchFilterValues
  genres: Genre[]
  genresLoading?: boolean
  onChange: (next: Partial<SearchFilterValues>) => void
  onClear: () => void
}

export const TYPE_OPTIONS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'movie', label: 'Films' },
  { value: 'tv', label: 'Series' },
]

export const YEAR_PRESETS = [
  { label: 'Any year', from: '', to: '' },
  { label: '2020s', from: '2020', to: '2029' },
  { label: '2010s', from: '2010', to: '2019' },
  { label: '2000s', from: '2000', to: '2009' },
  { label: '1990s', from: '1990', to: '1999' },
  { label: '1980s', from: '1980', to: '1989' },
]

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'title', label: 'Title A–Z' },
]

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '7', label: '7+' },
  { value: '8', label: '8+' },
  { value: '9', label: '9+' },
]

function DropdownItem({
  active,
  onClick,
  keepOpen,
  children,
  related,
}: {
  active: boolean
  onClick: () => void
  keepOpen?: boolean
  children: React.ReactNode
  related?: React.ReactNode
}) {
  const close = useCloseFilterPill()

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onClick()
          if (!keepOpen) close()
        }}
        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-canvas/60 ${
          active ? 'text-brass' : 'text-fg-secondary hover:text-fg'
        }`}
      >
        <span
          className={`size-1.5 shrink-0 rounded-full ${active ? 'bg-brass' : 'opacity-0'}`}
        />
        {children}
      </button>
      {active && related && (
        <div className="border-t border-border/60 bg-canvas/40 px-4 py-3">{related}</div>
      )}
    </div>
  )
}

function YearRangeFields({
  yearFrom,
  yearTo,
  onChange,
}: {
  yearFrom: string
  yearTo: string
  onChange: (next: Partial<SearchFilterValues>) => void
}) {
  return (
    <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
      <label className="sr-only" htmlFor="year-from">
        From year
      </label>
      <input
        id="year-from"
        type="number"
        inputMode="numeric"
        placeholder="From"
        value={yearFrom}
        onChange={(e) => onChange({ yearFrom: e.target.value })}
        className="w-20 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-brass"
      />
      <span className="text-xs text-fg-muted">–</span>
      <label className="sr-only" htmlFor="year-to">
        To year
      </label>
      <input
        id="year-to"
        type="number"
        inputMode="numeric"
        placeholder="To"
        value={yearTo}
        onChange={(e) => onChange({ yearTo: e.target.value })}
        className="w-20 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-brass"
      />
    </div>
  )
}

function RatingFields({
  minRating,
  onChange,
}: {
  minRating: string
  onChange: (next: Partial<SearchFilterValues>) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
      {RATING_OPTIONS.map((opt) => {
        const active = (minRating || '') === opt.value
        return (
          <button
            key={opt.value || 'any'}
            type="button"
            onClick={() => onChange({ minRating: opt.value })}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              active
                ? 'border-brass bg-brass/15 text-fg'
                : 'border-border text-fg-secondary hover:border-fg-muted hover:text-fg'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function SearchFilters({
  values,
  genres,
  genresLoading,
  onChange,
  onClear,
}: SearchFiltersProps) {
  const matchedPreset = YEAR_PRESETS.find(
    (p) => p.from === values.yearFrom && p.to === values.yearTo,
  )
  const yearLabel = matchedPreset?.label ?? (values.yearFrom || values.yearTo ? 'Custom' : 'Any year')
  const genreLabel = genres.find((g) => g.id === values.genreIds[0])?.name ?? 'All genres'
  const sortLabel =
    SORT_OPTIONS.find((s) => s.value === (values.sort || 'relevance'))?.label ?? 'Relevance'

  const typeActive = values.type !== 'all'
  const genreActive = values.genreIds.length > 0
  const yearActive = Boolean(values.yearFrom || values.yearTo)
  const sortActive = (values.sort !== 'relevance' && Boolean(values.sort)) || Boolean(values.minRating)
  const hasAnyActive = typeActive || genreActive || yearActive || Boolean(values.minRating)

  const isCustomYear = !matchedPreset && yearActive

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill
        label={
          values.type === 'all'
            ? 'All types'
            : (TYPE_OPTIONS.find((t) => t.value === values.type)?.label ?? 'All types')
        }
        active={typeActive}
      >
        {TYPE_OPTIONS.map((opt) => (
          <DropdownItem
            key={opt.value}
            active={values.type === opt.value}
            onClick={() => onChange({ type: opt.value, genreIds: [] })}
          >
            {opt.label}
          </DropdownItem>
        ))}
      </FilterPill>

      <FilterPill label={genreActive ? genreLabel : 'Genre'} active={genreActive}>
        <DropdownItem active={!genreActive} onClick={() => onChange({ genreIds: [] })}>
          All genres
        </DropdownItem>
        {genresLoading ? (
          <p className="px-4 py-3 text-sm text-fg-muted">Loading…</p>
        ) : (
          genres.map((genre) => (
            <DropdownItem
              key={genre.id}
              active={values.genreIds.includes(genre.id)}
              onClick={() => onChange({ genreIds: [genre.id] })}
            >
              {genre.name}
            </DropdownItem>
          ))
        )}
      </FilterPill>

      <FilterPill label={yearActive ? yearLabel : 'Year'} active={yearActive}>
        {YEAR_PRESETS.map((preset) => {
          const active = matchedPreset?.label === preset.label && !isCustomYear
          const showRange = active && preset.label !== 'Any year'
          return (
            <DropdownItem
              key={preset.label}
              active={active}
              keepOpen={showRange}
              onClick={() => onChange({ yearFrom: preset.from, yearTo: preset.to })}
              related={
                showRange ? (
                  <YearRangeFields
                    yearFrom={values.yearFrom}
                    yearTo={values.yearTo}
                    onChange={onChange}
                  />
                ) : undefined
              }
            >
              {preset.label}
            </DropdownItem>
          )
        })}
        <DropdownItem
          active={isCustomYear}
          keepOpen
          onClick={() => {
            if (!isCustomYear) onChange({ yearFrom: '2000', yearTo: '2026' })
          }}
          related={
            isCustomYear ? (
              <YearRangeFields
                yearFrom={values.yearFrom}
                yearTo={values.yearTo}
                onChange={onChange}
              />
            ) : undefined
          }
        >
          Custom
        </DropdownItem>
      </FilterPill>

      <FilterPill
        label={
          values.minRating
            ? `Sort: ${sortLabel} · ${values.minRating}+`
            : `Sort: ${sortLabel}`
        }
        active={sortActive}
      >
        {SORT_OPTIONS.map((opt) => {
          const active = (values.sort || 'relevance') === opt.value
          return (
            <DropdownItem
              key={opt.value}
              active={active}
              keepOpen={active}
              onClick={() => onChange({ sort: opt.value })}
              related={
                active ? (
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-fg-muted">
                      Min rating
                    </p>
                    <RatingFields minRating={values.minRating} onChange={onChange} />
                  </div>
                ) : undefined
              }
            >
              {opt.label}
            </DropdownItem>
          )
        })}
      </FilterPill>

      {hasAnyActive && (
        <button
          type="button"
          onClick={onClear}
          className="ml-1 text-xs text-fg-muted transition hover:text-brass"
        >
          Clear
        </button>
      )}
    </div>
  )
}
