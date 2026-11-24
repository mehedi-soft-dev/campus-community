import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { api } from '../api/axios.js';

/**
 * The header search.
 *
 * Replaces a bare input that could only submit a form. Now it offers live
 * suggestions, keyboard navigation, a clear button, and a shortcut — and it
 * tracks ?q= so landing on /posts?q=… fills the box.
 */
const DEBOUNCE_MS = 240;
const MIN_CHARS = 2;

export default function SearchBox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('idle');
  const [active, setActive] = useState(-1);

  const inputRef = useRef(null);
  const boxRef = useRef(null);

  // Keep the box in step with the URL, so /posts?q=crispr fills it in.
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  // "/" or Ctrl/Cmd+K focuses the box from anywhere on the page.
  useEffect(() => {
    const onKeyDown = (event) => {
      const el = event.target;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

      const slash = event.key === '/' && !typing;
      const commandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

      if (slash || commandK) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Debounced suggestions. Only fires once the term is worth searching for.
  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_CHARS) {
      setItems([]);
      setTotal(0);
      setStatus('idle');
      return undefined;
    }

    let cancelled = false;
    setStatus('loading');

    const timer = setTimeout(() => {
      api
        .get('/posts', { params: { q: term, pageSize: 5 } })
        .then(({ data }) => {
          if (cancelled) return;
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setStatus('ready');
        })
        .catch(() => {
          if (cancelled) return;
          setItems([]);
          setStatus('error');
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const term = query.trim();
  const showPanel = open && term.length >= MIN_CHARS;

  const goToResults = () => {
    setOpen(false);
    navigate(term ? `/posts?q=${encodeURIComponent(term)}` : '/posts');
  };

  const submit = (event) => {
    event.preventDefault();
    goToResults();
  };

  const clear = () => {
    setQuery('');
    setItems([]);
    setTotal(0);
    setStatus('idle');
    setActive(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      // First Escape closes the list, a second clears the box.
      if (showPanel) setOpen(false);
      else if (query) clear();
      return;
    }

    if (!showPanel || items.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (index + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (index <= 0 ? items.length - 1 : index - 1));
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      const post = items[active];
      setOpen(false);
      navigate(`/post/${post.id}`);
    }
  };

  return (
    <div className="search" ref={boxRef}>
      <form className="search__form" onSubmit={submit} role="search">
        <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          className="search__input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search posts…"
          aria-label="Search posts"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `search-option-${items[active]?.id}` : undefined}
          autoComplete="off"
        />

        {query ? (
          <button type="button" className="search__clear" onClick={clear} aria-label="Clear search">
            ×
          </button>
        ) : (
          <kbd className="search__kbd" aria-hidden="true">
            /
          </kbd>
        )}
      </form>

      {showPanel && (
        <div className="search__panel" id="search-suggestions" role="listbox" aria-label="Search results">
          {status === 'loading' && <p className="search__note">Searching…</p>}

          {status === 'error' && <p className="search__note">Search is unavailable right now.</p>}

          {status === 'ready' && items.length === 0 && (
            <p className="search__note">No posts match “{term}”.</p>
          )}

          {items.map((post, index) => (
            <button
              key={post.id}
              type="button"
              id={`search-option-${post.id}`}
              role="option"
              aria-selected={index === active}
              className={`search__item ${index === active ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => {
                setOpen(false);
                navigate(`/post/${post.id}`);
              }}
            >
              <span className="search__item-title">{post.title}</span>
              <span className="search__item-meta">
                {post.categoryName} · {moment(post.date).format('DD/MM/YYYY')}
              </span>
            </button>
          ))}

          {status === 'ready' && total > 0 && (
            <button type="button" className="search__all" onClick={goToResults}>
              See all {total} result{total === 1 ? '' : 's'} for “{term}” →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
