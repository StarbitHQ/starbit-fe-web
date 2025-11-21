"use client"; // <-- Add "use client" directive here

import Image from "next/image";
import { useTheme } from "next-themes"; // <-- Import useTheme
import { useState, useEffect } from "react"; // <-- Import useState and useEffect for hydration

export function StarBitLogo({
  className = "h-8 w-auto",
}: {
  className?: string;
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted to true once component has hydrated on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the correct icon source based on the theme
  const iconSrc = mounted && theme === "dark" 
    ? "/icon-dark.png" 
    : "/icon-light.png";

  // If not mounted, render a fallback or the light icon to prevent layout shift
  if (!mounted) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-xl font-bold text-foreground flex items-center">
                <span>Star</span>
                {/* Fallback to light icon during server render/hydration */}
                <Image
                    src="/icon-light.png"
                    alt="StarBit logo"
                    width={62} 
                    height={62}
                    className="object-contain" 
                    priority 
                />
            </span>
        </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl font-bold text-foreground flex items-center">
        
        {/* 'Star' Text */}
        <span>Star</span>
        
        <Image
          // Use the dynamic source based on the theme
          src={iconSrc}
          alt={`StarBit logo (${theme} mode)`}
          width={62} 
          height={62}
          className="object-contain" 
          priority 
        />
        
      </span>
    </div>
  );
}