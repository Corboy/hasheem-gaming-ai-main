import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { trackEvent } from "@/lib/analytics";
import wukongHero from "@/assets/hero/featured/wukong-hero.jpg";
import godOfWarHero from "@/assets/hero/featured/godofwar-hero.jpg";
import mortalKombatHero from "@/assets/hero/featured/mortalkombat-hero.jpg";
import wukongHeroTrailer from "@/assets/hero/video/wukong-hero-trailer.mp4";
import godOfWarHeroTrailer from "@/assets/hero/video/godofwar-hero-trailer.mp4";
import mortalKombatHeroTrailer from "@/assets/hero/video/mortalkombat-hero-trailer.mp4";

const STATIC_SLIDE_MS = 7000;
const FADE_DURATION_MS = 500;
const COVER_PREVIEW_MS = 1200;
const VIDEO_FALLBACK_MS = 110000;
const MK_VIDEO_FALLBACK_MS = 220000;

const heroBackgrounds = [
  {
    image: wukongHero,
    alt: "Black Myth Wukong official cover",
    video: wukongHeroTrailer,
    coverDelayMs: COVER_PREVIEW_MS,
    fallbackMs: VIDEO_FALLBACK_MS,
  },
  {
    image: godOfWarHero,
    alt: "God of War official cover",
    video: godOfWarHeroTrailer,
    coverDelayMs: COVER_PREVIEW_MS,
    fallbackMs: VIDEO_FALLBACK_MS,
  },
  {
    image: mortalKombatHero,
    alt: "Mortal Kombat official cover",
    video: mortalKombatHeroTrailer,
    coverDelayMs: COVER_PREVIEW_MS,
    fallbackMs: MK_VIDEO_FALLBACK_MS,
  },
];

const HeroSection = () => {
  const { settings } = useSiteSettings();
  const primaryLabel = settings.hero.primaryCtaLabel || "Browse Store";
  const secondaryLabel = settings.hero.secondaryCtaLabel || "View Deals";
  const storeHref = settings.hero.primaryCtaHref || "#store";
  const dealsHref = settings.hero.secondaryCtaHref || "#deals";
  const heroSlides = useMemo(
    () => [
      {
        ...heroBackgrounds[0],
        eyebrow: "Black Myth: Wukong",
        headline: "Cover first, then official Wukong trailer to the end",
        subtext:
          "Wukong starts with its official cover, then the trailer plays fully before moving ahead.",
      },
      {
        ...heroBackgrounds[1],
        eyebrow: "God of War",
        headline: "Official God of War cover, then full trailer playback",
        subtext:
          "God of War follows the same flow: game cover first, trailer plays to completion, then next slide.",
      },
      {
        ...heroBackgrounds[2],
        eyebrow: "Mortal Kombat",
        headline: "Mortal Kombat cover first, then full trailer sequence",
        subtext:
          "Mortal Kombat starts with the game cover, then the trailer runs to the end before switching.",
      },
    ],
    [],
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [videoVisibleIndex, setVideoVisibleIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const goToNextSlide = useCallback(() => {
    setActiveSlide((previous) => (previous + 1) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    heroSlides.forEach((slide) => {
      const image = new Image();
      image.src = slide.image;
    });
  }, [heroSlides]);

  useEffect(() => {
    const timers: number[] = [];
    setVideoVisibleIndex(null);

    videoRefs.current.forEach((video, index) => {
      if (!video || index === activeSlide) return;
      video.pause();
      video.currentTime = 0;
    });

    const active = heroSlides[activeSlide];
    if (!active.video) {
      const timer = window.setTimeout(goToNextSlide, STATIC_SLIDE_MS);
      return () => window.clearTimeout(timer);
    }

    const previewDelay = active.coverDelayMs ?? COVER_PREVIEW_MS;
    const fallbackDuration = active.fallbackMs ?? VIDEO_FALLBACK_MS;

    const showVideoTimer = window.setTimeout(() => {
      setVideoVisibleIndex(activeSlide);
      const video = videoRefs.current[activeSlide];
      if (!video) return;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => undefined);
      }
    }, previewDelay);
    timers.push(showVideoTimer);

    const fallbackTimer = window.setTimeout(() => {
      goToNextSlide();
    }, previewDelay + fallbackDuration);
    timers.push(fallbackTimer);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [activeSlide, goToNextSlide, heroSlides]);

  const handleVideoEnded = useCallback(
    (index: number) => {
      if (index !== activeSlide) return;
      goToNextSlide();
    },
    [activeSlide, goToNextSlide],
  );

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={`${slide.image}-${index}`}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
          >
            {slide.video ? (
              <>
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ease-in-out ${
                    videoVisibleIndex === index ? "opacity-0" : "opacity-100"
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <video
                  ref={(element) => {
                    videoRefs.current[index] = element;
                  }}
                  src={slide.video}
                  poster={slide.image}
                  muted
                  playsInline
                  preload="metadata"
                  onEnded={() => handleVideoEnded(index)}
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ease-in-out ${
                    videoVisibleIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              </>
            ) : (
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_48%,rgba(0,0,0,0.20)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(140%_72%_at_50%_0%,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0)_64%),radial-gradient(140%_72%_at_50%_100%,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0)_66%)]" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] w-full max-w-[1280px] items-center px-5 pb-8 pt-10 sm:px-8 lg:min-h-[90vh] lg:px-12 lg:pt-16">
        <div className="relative w-full max-w-[680px] min-h-[380px] text-left sm:min-h-[360px] md:min-h-[400px]">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.headline}
              aria-hidden={index !== activeSlide}
              className={`absolute inset-0 transition-opacity ease-out ${
                index === activeSlide ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
              style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
            >
              <div className="mb-6 inline-flex items-center rounded-full border border-white/15 bg-black/25 px-3.5 py-1.5">
                <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                  {slide.eyebrow}
                </span>
              </div>

              <h1
                className="mb-5 max-w-[14ch] font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl"
                style={{ lineHeight: 1.05, textWrap: "balance" }}
              >
                {slide.headline}
              </h1>

              <p className="mb-8 max-w-[580px] font-body text-base leading-relaxed text-slate-300 md:text-lg">
                {slide.subtext}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <a
                  href={storeHref}
                  className="button-lift inline-flex h-12 items-center justify-center rounded-md bg-primary px-7 font-body text-sm font-semibold text-primary-foreground shadow-[var(--primary-shadow)]"
                  onClick={() =>
                    trackEvent({
                      action: "hero_slide_cta",
                      category: "Conversion",
                      label: primaryLabel,
                    })
                  }
                >
                  {primaryLabel}
                </a>
                <a
                  href={dealsHref}
                  className="button-lift inline-flex h-12 items-center justify-center rounded-md border border-white/25 bg-white/5 px-7 font-body text-sm font-semibold text-slate-100 backdrop-blur-[2px] transition-colors hover:border-white/40 hover:bg-white/10"
                  onClick={() =>
                    trackEvent({
                      action: "hero_slide_cta",
                      category: "Conversion",
                      label: secondaryLabel,
                    })
                  }
                >
                  {secondaryLabel}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
