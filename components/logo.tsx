"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Hexagon } from "lucide-react";

interface LogoProps {
  /** Height in pixels; width scales to preserve aspect ratio if only height is set. */
  height?: number;
  /** Optional width; if omitted, width is derived from height (same as height for square-ish fallback). */
  width?: number;
  /** Additional class names for the wrapper link. */
  className?: string;
  /** Whether to show "Conneco Right" text next to the logo (e.g. for sidebar when expanded). */
  showText?: boolean;
}

const DEFAULT_HEIGHT = 32;

/** Project logo (icon only, from logo_v.svg with "conneco" text removed). */
const LOGO_SRC = "/logo.svg";

/**
 * Project logo. Uses public/logo.svg (icon only).
 * If the image fails to load, falls back to Hexagon icon + "Conneco Right" text.
 */
export function Logo({
  height = DEFAULT_HEIGHT,
  width,
  className,
  showText = false,
}: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const w = width ?? height;
  const h = height;
  const src = LOGO_SRC;

  const textEl = showText ? (
    <span className="text-base font-semibold tracking-tight text-[#006039]">
      Conneco Right
    </span>
  ) : null;

  if (imgFailed) {
    return (
      <Link href="/" className={`flex items-center gap-2.5 ${className ?? ""}`}>
        <Hexagon className="shrink-0 text-accent" strokeWidth={1.5} style={{ width: w, height: h }} />
        {textEl}
      </Link>
    );
  }

  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <Image
        src={src}
        alt="Conneco Right"
        width={w}
        height={h}
        className="shrink-0 object-contain"
        priority
        unoptimized
        onError={() => setImgFailed(true)}
      />
      {textEl}
    </Link>
  );
}
