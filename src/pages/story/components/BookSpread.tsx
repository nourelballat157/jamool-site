import type { CSSProperties, ReactNode } from "react";

type BookSpreadProps = {
  image: string;
  alt: string;
  focus: string;
  zoom: number;
  icon: string;
  /** small chip on the picture, e.g. the page counter */
  chip?: string;
  children: ReactNode;
};

/**
 * One open book: the picture on one side, the text on the other (stacked on mobile).
 * The single cover image is cropped / zoomed differently on every page so each page
 * feels like a new scene.
 */
export default function BookSpread({ image, alt, focus, zoom, icon, chip, children }: BookSpreadProps) {
  const picStyle = { objectPosition: focus, transformOrigin: focus, "--z": zoom } as CSSProperties;

  return (
    <div className="card grid overflow-hidden lg:grid-cols-2">
      <div className="relative h-64 overflow-hidden bg-violet-50 sm:h-80 lg:h-auto lg:min-h-[30rem]">
        <img
          src={image}
          alt={alt}
          className="story-pic absolute inset-0 h-full w-full object-cover"
          style={picStyle}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground-950/35 via-transparent to-transparent" />
        {chip ? (
          <span className="absolute start-4 top-4 rounded-full bg-background-50/95 px-3 py-1 text-xs font-bold text-violet-700">
            {chip}
          </span>
        ) : null}
        <span aria-hidden="true" className="motion-safe:animate-floaty absolute end-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-background-50/95 text-2xl text-violet-600 md:h-14 md:w-14 md:text-3xl">
          <i className={icon} />
        </span>
      </div>

      <div className="relative flex min-h-[16rem] flex-col justify-center p-6 sm:p-8 lg:p-12">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-0 hidden w-8 bg-gradient-to-l from-foreground-950/[0.07] to-transparent lg:block" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-0 hidden w-px bg-background-200 lg:block" />
        {children}
      </div>
    </div>
  );
}
