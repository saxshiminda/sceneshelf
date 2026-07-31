import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const CloseCtx = createContext<() => void>(() => {})
export function useCloseFilterPill() {
  return useContext(CloseCtx)
}

interface FilterPillProps {
  label: string
  active?: boolean
  children: ReactNode
}

export default function FilterPill({ label, active = false, children }: FilterPillProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
          active
            ? 'border-brass bg-brass/10 text-fg'
            : 'border-border bg-elevated/30 text-fg-secondary hover:border-fg-muted hover:text-fg'
        }`}
      >
        {label}
        <ChevronDownIcon
          className={`size-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 max-h-72 min-w-[11rem] overflow-y-auto rounded-lg border border-border bg-elevated py-1 shadow-xl [scrollbar-width:thin]">
          <CloseCtx.Provider value={() => setOpen(false)}>
            {children}
          </CloseCtx.Provider>
        </div>
      )}
    </div>
  )
}
