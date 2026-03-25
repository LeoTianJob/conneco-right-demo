"use client";

import { useState, useEffect } from "react";

const quotes = [
  {
    text: "Creativity is intelligence having fun.",
    author: "Albert Einstein",
  },
  {
    text: "Every artist was first an amateur.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "Art is not what you see, but what you make others see.",
    author: "Edgar Degas",
  },
];

/**
 * @description Rotating editorial quotes for the auth layout right column.
 */
export function AuthQuoteCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex w-full flex-col items-center justify-center p-12 lg:p-24">
      <div className="relative flex min-h-[50vh] w-full max-w-2xl flex-col items-center justify-center">
        {quotes.map((q, i) => (
          <div
            key={i}
            className="absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-1000 ease-in-out"
            style={{
              opacity: i === index ? 1 : 0,
              transform:
                i === index ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
              pointerEvents: i === index ? "auto" : "none",
            }}
          >
            <p className="font-serif text-4xl leading-snug tracking-tight text-foreground md:text-5xl lg:text-6xl italic">
              {`\u201C${q.text}\u201D`}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-[1px] w-8 bg-accent" />
              <span className="text-sm tracking-[0.2em] font-medium uppercase text-accent">
                {q.author}
              </span>
              <div className="h-[1px] w-8 bg-accent" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        {quotes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-500 hover:opacity-100 ${i === index
                ? "bg-accent w-8 h-1.5 rounded-full opacity-100"
                : "bg-foreground/20 w-1.5 h-1.5 rounded-full opacity-60"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
