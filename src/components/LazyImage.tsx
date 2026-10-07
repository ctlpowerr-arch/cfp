import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string; // e.g. 'aspect-video' or 'aspect-[4/3]'
  optimizedWidth?: number;
  optimizedQuality?: number;
}

/**
 * High Performance LazyImage Component
 * - Native lazy loading (`loading="lazy"`)
 * - Decoding async (`decoding="async"`)
 * - Automatic WebP/AVIF format optimization & responsive width
 * - Low-quality placeholder / blur transition during fetch
 * - Fallback handling if an image fails to load
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=70',
  className = '',
  aspectRatio,
  optimizedWidth = 600,
  optimizedQuality = 75,
  referrerPolicy = 'no-referrer',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Compute optimized URL
  let finalSrc = hasError ? fallbackSrc : src;
  if (!hasError && finalSrc && finalSrc.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(finalSrc);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', 'crop');
      parsedUrl.searchParams.set('w', optimizedWidth.toString());
      parsedUrl.searchParams.set('q', optimizedQuality.toString());
      finalSrc = parsedUrl.toString();
    } catch {
      // keep original
    }
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${aspectRatio || 'w-full h-full'}`}>
      {/* Subtle skeleton shimmer before load */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse" />
      )}

      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy={referrerPolicy}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
