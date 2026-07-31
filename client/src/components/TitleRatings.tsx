interface TitleRatingsProps {
  score?: number | null
  votes?: number | null
}

export default function TitleRatings({ score, votes }: TitleRatingsProps) {
  if (typeof score !== 'number' || score <= 0) return null

  return (
    <div className="mt-5 inline-flex w-fit items-center gap-2 self-start rounded-md border border-border bg-elevated/40 px-3 py-2">
      <span className="text-[10px] font-medium tracking-wide text-fg-muted uppercase">
        TMDB
      </span>
      <span className="font-display text-lg leading-none text-fg">{score.toFixed(1)}</span>
      {votes != null && votes > 0 && (
        <span className="text-[10px] text-fg-muted">{votes.toLocaleString()} votes</span>
      )}
    </div>
  )
}
