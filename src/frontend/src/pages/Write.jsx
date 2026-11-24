import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { api, errorMessage, fieldErrors } from '../api/axios.js';
import { useCategories } from '../hooks/useCategories.js';
import { mediaUrl } from '../utils/media.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

// No image button: inline base64 images bloat the post body. Cover images are
// uploaded through /api/upload instead and stored as a filename.
const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'blockquote',
  'code-block',
  'link',
];

// Quill represents an empty document as "<p><br></p>", which is non-empty as a
// string but blank to a reader.
const isBlank = (html) =>
  !html ||
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim().length === 0;

// Mirrors the `desc` limit in src/backend/schemas.js. Checked here so an
// oversized post fails with a useful message instead of a 400/413 from the API.
const MAX_BODY_CHARS = 50_000;

// The cover is cropped to 16:9 in every place it appears (post page, home
// feature, listing grid), so this is the shape an author should supply.
const COVER_WIDTH = 1280;
const COVER_HEIGHT = 720;
const COVER_RATIO = COVER_WIDTH / COVER_HEIGHT;

// Close enough to 16:9 that `object-fit: cover` barely trims anything.
const COVER_TOLERANCE = 0.15;

/** Reads the chosen file's natural size so the crop can be warned about early. */
const readImageSize = (file) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    probe.src = url;
  });

export default function Write() {
  const location = useLocation();
  const navigate = useNavigate();
  const editing = location.state?.post ?? null;

  const { categories } = useCategories();

  const [title, setTitle] = useState(editing?.title ?? '');
  const [categoryId, setCategoryId] = useState(
    editing?.categoryId ? String(editing.categoryId) : ''
  );
  const [desc, setDesc] = useState(editing?.desc ?? '');
  const [img, setImg] = useState(editing?.img ?? '');
  const [preview, setPreview] = useState(mediaUrl(editing?.img));

  const [uploading, setUploading] = useState(false);
  const [ratioWarning, setRatioWarning] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  usePageTitle(editing ? 'Update your post' : 'Write a post');

  const fileRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  // Categories arrive from the API, so default to the first one once they load.
  useEffect(() => {
    if (!categoryId && categories.length) setCategoryId(String(categories[0].id));
  }, [categories, categoryId]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show the local file immediately; swap to the server filename once stored.
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setPreview(objectUrlRef.current);
    setUploading(true);
    setMessage('');
    setRatioWarning('');
    setErrors((prev) => ({ ...prev, img: undefined }));

    // Warn, but do not block: a mismatched image still uploads, the author is
    // just told which part of it the 16:9 crop will remove. The cover fills the
    // box (object-fit: cover), so whichever dimension is proportionally larger
    // is the one that gets trimmed — a tall image loses its top and bottom, a
    // very wide one loses its sides.
    readImageSize(file).then((size) => {
      if (!size || !size.height) return;
      const ratio = size.width / size.height;
      if (Math.abs(ratio - COVER_RATIO) <= COVER_TOLERANCE) return;

      setRatioWarning(
        ratio < COVER_RATIO
          ? `That image is ${size.width}×${size.height} — taller than 16:9, so its top and ` +
              `bottom will be cropped. ${COVER_WIDTH}×${COVER_HEIGHT} fits exactly.`
          : `That image is ${size.width}×${size.height} — wider than 16:9, so its left and ` +
              `right edges will be cropped. ${COVER_WIDTH}×${COVER_HEIGHT} fits exactly.`
      );
    });

    try {
      const body = new FormData();
      body.append('file', file);
      const { data } = await api.post('/upload', body);
      setImg(data.filename);
    } catch (err) {
      setMessage(errorMessage(err, 'Could not upload that image.'));
      setPreview(mediaUrl(editing?.img));
      setImg(editing?.img ?? '');
      if (fileRef.current) fileRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImg('');
    setPreview(null);
    setRatioWarning('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'A title is required.';
    if (!categoryId) nextErrors.category = 'Pick a category.';
    if (isBlank(desc)) {
      nextErrors.desc = 'The post body cannot be empty.';
    } else if (desc.length > MAX_BODY_CHARS) {
      nextErrors.desc =
        `The post body is ${desc.length.toLocaleString()} characters, over the ` +
        `${MAX_BODY_CHARS.toLocaleString()} limit. Pasting an image into the editor inserts it as ` +
        'a long base64 string — use the cover image picker instead.';
    }
    if (uploading) nextErrors.img = 'Wait for the image to finish uploading.';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setMessage('');
      return;
    }

    setBusy(true);
    setErrors({});
    setMessage('');

    const payload = {
      title: title.trim(),
      desc,
      categoryId: Number(categoryId),
      img: img || '',
    };

    try {
      const { data } = editing
        ? await api.put(`/posts/${editing.id}`, payload)
        : await api.post('/posts', payload);
      navigate(`/post/${data.id}`);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      setMessage(Object.keys(fields).length ? '' : errorMessage(err, 'Could not save the post.'));
      setBusy(false);
    }
  };

  return (
    <div className="write">
      <header className="write__header">
        <p className="eyebrow">{editing ? 'Editing' : 'New post'}</p>
        <h1>{editing ? 'Update your post' : 'Write something'}</h1>
      </header>

      <form className="write__form" onSubmit={handleSubmit} noValidate>
        {message && <div className="banner banner--error">{message}</div>}

        <div className="write__row">
          <label className="field field--grow">
            <span>Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A headline that earns the click"
              autoFocus
            />
            {errors.title && <em className="field__error">{errors.title}</em>}
          </label>

          <label className="field">
            <span>Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && <em className="field__error">{errors.category}</em>}
          </label>
        </div>

        <div className="write__cover">
          <span className="field__label">Cover image</span>

          <div className="write__cover-row">
            <div className="write__preview">
              {preview ? <img src={preview} alt="" /> : <span>No image</span>}
            </div>

            <div className="write__cover-controls">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={handleFile}
              />
              <p className="field__hint">
                Best at <strong>{COVER_WIDTH}×{COVER_HEIGHT}</strong> (16:9 — the shape covers are
                cropped to wherever they appear). PNG, JPEG, WebP, GIF or AVIF, up to 5 MB.{' '}
                {uploading && <strong>Uploading…</strong>}
              </p>
              {ratioWarning && <p className="field__hint field__hint--warn">{ratioWarning}</p>}
              {preview && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={removeImage}>
                  Remove image
                </button>
              )}
            </div>
          </div>
          {errors.img && <em className="field__error">{errors.img}</em>}
        </div>

        <div className="write__editor">
          <span className="field__label">Body</span>
          <ReactQuill
            theme="snow"
            value={desc}
            onChange={setDesc}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            placeholder="Tell the story…"
          />
          {errors.desc && <em className="field__error">{errors.desc}</em>}
          <div className="write__editor-meta">
            <span className={desc.length > MAX_BODY_CHARS ? 'is-over' : undefined}>
              {desc.length.toLocaleString()} / {MAX_BODY_CHARS.toLocaleString()} characters
            </span>
          </div>
        </div>

        <div className="write__actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy || uploading}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Publish post'}
          </button>
        </div>
      </form>
    </div>
  );
}
