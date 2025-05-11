import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className,
  objectFit = "cover",
  onLoad,
  ...props
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Show skeleton while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        onLoad={handleImageLoad}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          {
            "object-contain": objectFit === "contain",
            "object-cover": objectFit === "cover",
            "object-fill": objectFit === "fill",
            "object-none": objectFit === "none",
            "object-scale-down": objectFit === "scale-down",
          }
        )}
        {...props}
      />
    </div>
  );
}
