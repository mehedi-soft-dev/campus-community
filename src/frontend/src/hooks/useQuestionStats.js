import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/axios.js';

/**
 * Backing data for the navbar badge.
 *
 * Refetched on every navigation rather than polled: answering a question is a
 * navigation away and back, so this keeps the number honest with one small
 * aggregate query and no timer. An error is swallowed on purpose — a badge is
 * not worth surfacing a failure for.
 */
export function useQuestionStats() {
  const location = useLocation();
  const [stats, setStats] = useState({ total: 0, unanswered: 0, answered: 0 });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/questions/stats');
      setStats({
        total: Number(data.total ?? 0),
        unanswered: Number(data.unanswered ?? 0),
        answered: Number(data.answered ?? 0),
      });
    } catch {
      // leave the previous numbers in place
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, location.pathname]);

  return stats;
}
