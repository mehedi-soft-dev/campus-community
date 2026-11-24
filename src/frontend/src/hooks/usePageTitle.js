import { useEffect } from 'react';

const SITE = 'University of South Asia';

/**
 * Sets the browser tab title for a page.
 *
 * Pages with data (a post, a notice) pass the loaded title, so the tab reads
 * "What is Lorem Ipsum? · University of South Asia" once the fetch resolves.
 * Passing nothing falls back to the site title alone.
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
  }, [title]);
}
