import { useEffect, useRef } from 'react';

const isInViewport = (el) => {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
};

/**
 * Reveals `[data-reveal]` descendants as they scroll into view.
 *
 * Two safety rules:
 *  1. The `.reveal` class (which sets opacity: 0) is added by this hook, never in
 *     markup, so content stays visible if JavaScript never runs.
 *  2. Anything already in the viewport at bind time is left completely alone —
 *     it is never hidden and never depends on an IntersectionObserver callback.
 *     Otherwise above-the-fold content can be captured mid-fade or, if the
 *     callback is delayed, stay invisible.
 *
 * Pass the values that change the rendered list so the observer re-binds when
 * new items arrive.
 */
export function useReveal(deps = [], { stagger = 55 } = {}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const items = [...root.querySelectorAll('[data-reveal]:not(.is-visible)')];
    if (!items.length) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      items.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const pending = items.filter((el) => !isInViewport(el));
    if (!pending.length) return undefined;

    pending.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.style.transitionDelay = `${Math.min(order, 8) * stagger}ms`;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
          order += 1;
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    pending.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rootRef;
}
