import { useEffect, useState } from 'react';
import { api } from '../api/axios.js';

// Departments change rarely, so this is cached the same way as categories.
let cached = null;
let inflight = null;

export function useDepartments() {
  const [departments, setDepartments] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return undefined;

    if (!inflight) {
      inflight = api
        .get('/departments')
        .then(({ data }) => {
          cached = data;
          return data;
        })
        .catch(() => [])
        .finally(() => {
          inflight = null;
        });
    }

    let cancelled = false;
    inflight.then((data) => {
      if (cancelled) return;
      setDepartments(data ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { departments, loading };
}
