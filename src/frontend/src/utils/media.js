// Post images are stored as bare filenames served by the API at /uploads.
// User avatars may be either a filename or an absolute URL.
export function mediaUrl(value) {
  if (!value) return null;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
  return `/uploads/${value}`;
}

export function initials(name = '') {
  return name
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// Attachments are not always PDFs — the upload endpoint accepts images and
// Office documents too, so the link label is derived from the stored type
// instead of assuming "PDF".
const MIME_LABELS = {
  'application/pdf': 'PDF',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WEBP',
  'image/gif': 'GIF',
  'image/avif': 'AVIF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/zip': 'ZIP',
};

export const isImageFile = (mime) => typeof mime === 'string' && mime.startsWith('image/');

/** Short label for an attachment: PDF, PNG, DOCX, ZIP, … */
export function fileLabel(mime, name) {
  if (MIME_LABELS[mime]) return MIME_LABELS[mime];

  const extension = typeof name === 'string' ? name.split('.').pop() : '';
  if (extension && extension.length <= 5 && /^[a-z0-9]+$/i.test(extension)) {
    return extension.toUpperCase();
  }

  return 'FILE';
}
