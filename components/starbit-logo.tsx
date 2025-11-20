export function StarBitLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Star shape */}
          <path
            d="M16 2L19.5 12.5L30 16L19.5 19.5L16 30L12.5 19.5L2 16L12.5 12.5L16 2Z"
            fill="url(#star-gradient)"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary"
          />
          {/* Candlestick element */}
          <rect x="14" y="10" width="4" height="12" fill="currentColor" className="text-secondary" />
          <rect x="13" y="8" width="6" height="2" fill="currentColor" className="text-secondary" />
          <rect x="13" y="22" width="6" height="2" fill="currentColor" className="text-secondary" />
          <defs>
            <linearGradient id="star-gradient" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00FF00" />
              <stop offset="1" stopColor="#FFFF00" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="text-xl font-bold text-foreground">StarBiit</span>
    </div>
  )
}
