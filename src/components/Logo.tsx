interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 28, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" className="fill-zinc-950 dark:fill-white" />
      {/* Book left page */}
      <path
        d="M16 10.8C13.2 9.5 9.8 9.8 7 10.8V22.2C9.8 21.2 13.2 20.9 16 22.2V10.8Z"
        fill="#6366F1"
      />
      {/* Book right page */}
      <path
        d="M16 10.8C18.8 9.5 22.2 9.8 25 10.8V22.2C22.2 21.2 18.8 20.9 16 22.2V10.8Z"
        fill="#818CF8"
      />
      {/* Subtle Page text lines */}
      <line x1="9.5" y1="14.2" x2="14" y2="13.5" stroke="white" strokeOpacity="0.85" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="9.5" y1="17.8" x2="14" y2="17.1" stroke="white" strokeOpacity="0.85" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="18" y1="13.5" x2="22.5" y2="14.2" stroke="white" strokeOpacity="0.85" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="18" y1="17.1" x2="22.5" y2="17.8" stroke="white" strokeOpacity="0.85" strokeWidth="1.1" strokeLinecap="round" />
      {/* Spine */}
      <path d="M16 10.2V22.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bookmark Ribbon */}
      <path d="M15 8.5H17V13.8L16 13L15 13.8V8.5Z" fill="#F43F5E" />
    </svg>
  )
}
