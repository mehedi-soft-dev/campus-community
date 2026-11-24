import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15_000,
});

// All API errors share the shape { error: { message, code, fields? } }.
export function errorMessage(err, fallback = 'Something went wrong.') {
  const error = err?.response?.data?.error;
  if (error?.fields?.length) {
    return error.fields.map((field) => field.message).join(' ');
  }
  if (error?.message) return error.message;

  // No response at all means the request never completed. Surface the real
  // cause instead of guessing, and leave it in the console for diagnosis.
  if (err?.code === 'ERR_NETWORK') {
    console.error('[api] request failed before a response:', err);
    return (
      'The request never reached the API. Check the terminal running `npm run dev` ' +
      'for the matching request, then try again.'
    );
  }
  if (err?.code === 'ECONNABORTED') {
    return 'The request timed out. Please check the API terminal and try again.';
  }

  return err?.message || fallback;
}

export function fieldErrors(err) {
  const fields = err?.response?.data?.error?.fields;
  if (!Array.isArray(fields)) return {};
  return Object.fromEntries(fields.map((field) => [field.path, field.message]));
}
