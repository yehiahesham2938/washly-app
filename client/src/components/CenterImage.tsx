import { useEffect, useState } from "react";

import {
  CENTER_IMAGE_PLACEHOLDER,
  normalizeCenterImageSrc,
} from "@/lib/centerImage";
import { cn } from "@/lib/utils";

type CenterImageProps = {
  src: string | undefined;
  alt?: string;
  className?: string;
};

/**
 * Center hero/card photo. Uses a local placeholder if the URL is missing or fails to load
 * (common with hotlinked CDN images or truncated admin uploads).
 */
export function CenterImage({ src, alt = "", className }: CenterImageProps) {
  const normalized = normalizeCenterImageSrc(src);
  const [usePlaceholder, setUsePlaceholder] = useState(!normalized);

  useEffect(() => {
    setUsePlaceholder(!normalized);
  }, [normalized]);

  const imgSrc = usePlaceholder ? CENTER_IMAGE_PLACEHOLDER : normalized!;

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(className)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setUsePlaceholder(true)}
    />
  );
}
