import { Link } from 'react-router-dom'

const sizeClass = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52',
} as const

type LogoProps = {
  size?: keyof typeof sizeClass
  to?: string | null
  className?: string
  onClick?: () => void
  alt?: string
}

export default function Logo({
  size = 'sm',
  to = '/home',
  className = '',
  onClick,
  alt = 'SceneShelf',
}: LogoProps) {
  const img = (
    <img
      src="/logo.png"
      alt={alt}
      width={1024}
      height={1024}
      className={`${sizeClass[size]} rounded-[22%] object-cover shadow-sm ${className}`}
      decoding="async"
    />
  )

  if (!to) return img

  return (
    <Link
      to={to}
      onClick={onClick}
      className="inline-flex shrink-0 transition hover:opacity-90"
      aria-label="SceneShelf home"
    >
      {img}
    </Link>
  )
}
