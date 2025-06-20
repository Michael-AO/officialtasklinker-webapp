import Image from "next/image"

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "full" | "icon" | "text"
  className?: string
}

export function BrandLogo({ size = "md", variant = "full", className = "" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl",
    xl: "text-3xl",
  }

  if (variant === "icon") {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <Image
          src="/images/logo-icon.svg"
          alt="Tasklinkers"
          width={64}
          height={64}
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  if (variant === "text") {
    return <span className={`font-bold text-brand ${textSizeClasses[size]} ${className}`}>Tasklinkers</span>
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={sizeClasses[size]}>
        <Image
          src="/images/logo-full.svg"
          alt="Tasklinkers"
          width={200}
          height={64}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  )
}
