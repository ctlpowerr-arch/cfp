import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useBranding } from "@/context/BrandingContext";

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'seal' | 'mark';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showSubtitle?: boolean;
  overrideLogoUrl?: string;
  overrideName?: string;
}

export default function AppLogo({
  size = 'md',
  variant = 'full',
  theme = 'auto',
  className,
  showSubtitle = false,
  overrideLogoUrl,
  overrideName
}: AppLogoProps) {
  const { branding } = useBranding();
  const [hasImageError, setHasImageError] = useState(false);

  const activeLogoUrl = overrideLogoUrl !== undefined ? overrideLogoUrl : branding.logoUrl;
  const hasCustomLogo = !!activeLogoUrl && !hasImageError;
  const acronym = overrideName || branding.acronym || "CFP-ITMC";
  const fullName = branding.institutionFullName || "Institut & Centre de Formation Professionnelle aux Métiers des Technologies et du Management";
  const city = branding.city || "Douala - Logpom";

  // Dimensions based on size
  const iconSizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  const textSizes = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base font-black',
    md: 'text-base sm:text-lg font-black',
    lg: 'text-xl sm:text-2xl font-black',
    xl: 'text-2xl sm:text-3xl font-black'
  };

  // Official Institutional Vector Crest
  const LogoCrest = ({ className: cName }: { className?: string }) => (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", cName)}
    >
      <defs>
        <linearGradient id="crestGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="shieldBorder" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Circular Base instead of shield */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="url(#crestGrad)" 
        stroke="url(#goldGrad)" 
        strokeWidth="3.5"
      />

      {/* Internal decorative circular contour */}
      <circle 
        cx="50" 
        cy="50" 
        r="39" 
        fill="none" 
        stroke="rgba(255,255,255,0.22)" 
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />

      {/* Graduation Cap (Mortarboard) on top */}
      <path 
        d="M50 24 L74 34 L50 44 L26 34 Z" 
        fill="url(#goldGrad)" 
      />
      <path 
        d="M36 40 V48 C36 53 42 56 50 56 C58 56 64 53 64 48 V40" 
        fill="none" 
        stroke="url(#goldGrad)" 
        strokeWidth="2" 
      />
      {/* Tassel */}
      <path 
        d="M66 38 V50 L68 53" 
        stroke="#fef08a" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />

      {/* Open Academic Book */}
      <path 
        d="M32 62 C38 60 46 61 50 64 C54 61 62 60 68 62 V76 C62 74 54 75 50 78 C46 75 38 74 32 76 Z" 
        fill="#ffffff" 
      />
      <path 
        d="M50 64 V78" 
        stroke="#1e3a8a" 
        strokeWidth="1.5" 
      />

      {/* Tech Circuit Node / Dots */}
      <circle cx="28" cy="46" r="2" fill="#60a5fa" />
      <path d="M28 46 L34 50" stroke="#60a5fa" strokeWidth="1" />
      <circle cx="72" cy="46" r="2" fill="#60a5fa" />
      <path d="M72 46 L66 50" stroke="#60a5fa" strokeWidth="1" />

      {/* Center Golden Star */}
      <polygon 
        points="50,48 52,52 56,52 53,55 54,59 50,57 46,59 47,55 44,52 48,52" 
        fill="url(#goldGrad)" 
      />
    </svg>
  );

  // Custom Logo Render with graceful circular styling
  const renderVisualBadge = (extraClasses?: string) => {
    if (hasCustomLogo) {
      return (
        <div className={cn("relative flex items-center justify-center shrink-0 aspect-square overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-blue-600/20 border border-slate-200/80 p-0.5", iconSizes[size], extraClasses)}>
          <img 
            src={activeLogoUrl} 
            alt={acronym} 
            className="w-full h-full object-cover rounded-full"
            onError={() => setHasImageError(true)}
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }
    return <LogoCrest className={cn("rounded-full", iconSizes[size], extraClasses)} />;
  };

  // Official Circular Stamp / Seal for Transcripts & Diplomas
  if (variant === 'seal') {
    return (
      <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
        <svg viewBox="0 0 160 160" className={cn(iconSizes[size] || "w-32 h-32")}>
          {/* Outer double border */}
          <circle cx="80" cy="80" r="76" stroke="#1e3a8a" strokeWidth="2.5" fill="none" strokeDasharray="3 2" />
          <circle cx="80" cy="80" r="70" stroke="#1e3a8a" strokeWidth="1.5" fill="#f8fafc" />
          
          {/* Circular Seal Headers */}
          <text x="80" y="24" fill="#1e3a8a" fontSize="7.5" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
            FORMATION PROFESSIONNELLE
          </text>
          <text x="80" y="32" fill="#2563eb" fontSize="6.5" fontWeight="800" textAnchor="middle" letterSpacing="0.5">
            MINEFOP CAMEROUN
          </text>
          
          {/* Circular Seal Footers */}
          <text x="80" y="138" fill="#1e3a8a" fontSize="8" fontWeight="900" textAnchor="middle" letterSpacing="1">
            ★ {acronym.toUpperCase()} DOUALA ★
          </text>
          <text x="80" y="147" fill="#64748b" fontSize="6" fontWeight="700" textAnchor="middle" letterSpacing="0.5">
            LOGPOM BASSONG
          </text>

          {/* Inner ring */}
          <circle cx="80" cy="80" r="44" stroke="#d97706" strokeWidth="2" fill="#ffffff" />

          {/* Centered Crest or Logo */}
          {hasCustomLogo ? (
            <image href={activeLogoUrl} x="44" y="44" width="72" height="72" preserveAspectRatio="xMidYMid meet" />
          ) : (
            <g transform="translate(48, 48) scale(0.64)">
              <LogoCrest className="w-16 h-16" />
            </g>
          )}
        </svg>
      </div>
    );
  }

  if (variant === 'mark') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {renderVisualBadge()}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("inline-flex items-center gap-2.5", className)}>
        {renderVisualBadge()}
        <div className="flex flex-col">
          <span className={cn("font-black tracking-tight leading-none text-slate-900 dark:text-white", textSizes[size])}>
            {acronym.includes('-') ? (
              <>
                {acronym.split('-')[0]}-<span className="text-blue-600 dark:text-blue-400">{acronym.split('-').slice(1).join('-')}</span>
              </>
            ) : (
              <span className="text-blue-600 dark:text-blue-400">{acronym}</span>
            )}
          </span>
          {showSubtitle && (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              {city}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default 'full' variant
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="relative group">
        {renderVisualBadge("drop-shadow-md transition-transform duration-200 group-hover:scale-105")}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={cn("font-black tracking-tighter text-slate-900 dark:text-white", textSizes[size])}>
            {acronym.includes('-') ? (
              <>
                {acronym.split('-')[0]}-<span className="text-blue-600 dark:text-blue-400">{acronym.split('-').slice(1).join('-')}</span>
              </>
            ) : (
              <span className="text-blue-600 dark:text-blue-400">{acronym}</span>
            )}
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-1 hidden sm:block">
            {city}
          </span>
        )}
      </div>
    </div>
  );
}

export { AppLogo };
