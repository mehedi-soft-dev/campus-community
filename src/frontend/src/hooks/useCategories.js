import { useEffect, useState } from 'react';
import { api } from '../api/axios.js';

// Categories are database-driven now, so they are fetched rather than imported.
// A module-level cache keeps this to one request for the lifetime of the page.
let cached = null;
let inflight = null;

function load() {
  if (!inflight) {
    inflight = api
      .get('/categories')
      .then(({ data }) => {
        cached = data;
        return data;
      })
      .catch(() => [])
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useCategories() {
  const [categories, setCategories] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return undefined;

    let cancelled = false;
    load().then((data) => {
      if (cancelled) return;
      setCategories(data ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}

/** Clears the cache — call after an admin edits categories. */
export function invalidateCategories() {
  cached = null;
  inflight = null;
}

export const categoryLabel = (categories, code) =>
  categories.find((category) => category.code === code)?.name ?? 'General';

export const categoryHue = (categories, code) =>
  categories.find((category) => category.code === code)?.accentHue ?? 220;
