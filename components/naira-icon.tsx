interface NairaIconProps {
    className?: string
  }
  
  export function NairaIcon({ className = "h-4 w-4" }: NairaIconProps) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3v18" />
        <path d="M18 3v18" />
        <path d="M6 8h12" />
        <path d="M6 16h12" />
        <path d="M9 3l6 18" />
      </svg>
    )
  }
  