"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

type UseInViewOptions = IntersectionObserverInit & {
  once?: boolean;
};

export const useInView = (options: UseInViewOptions = { threshold: 0.1, once: true }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsInView(true);
        if (options.once && ref.current) {
          observer.unobserve(ref.current);
        }
      } else if (!options.once) {
        setIsInView(false);
      }
    },
    [options.once]
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(observerCallback, options);
    observer.observe(node);

    return () => observer.disconnect();
  }, [observerCallback, options]);

  return { ref, isInView };
};
