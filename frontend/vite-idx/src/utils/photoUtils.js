const PHOTO_URL_PATTERN = /https?:\/\/[^\s,]+/i;
const PHOTO_KEYS = [
  'url',
  'src',
  'image',
  'img',
  'photo',
  'thumbnail',
  'href',
  'imageUrl',
  'imageURL',
  'ImageUrl',
  'L_Photos',
  'photos',
  'images',
  'Images',
];

export const isHttpUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value.trim());

export const sanitizePhotoUrls = (photos = [], { maxPhotos = Number.POSITIVE_INFINITY } = {}) => {
  const results = [];
  const seen = new Set();

  for (const photo of photos || []) {
    if (typeof photo !== 'string') continue;

    const rawValue = photo.trim();
    if (!rawValue) continue;

    const match = rawValue.match(PHOTO_URL_PATTERN);
    const url = match ? match[0] : rawValue;

    if (!isHttpUrl(url)) continue;
    if (seen.has(url)) continue;

    seen.add(url);
    results.push(url);

    if (results.length >= maxPhotos) break;
  }

  return results;
};

export const isPhotoUrl = (url) => {
  if (!isHttpUrl(url)) return false;

  const value = url.trim();
  if (/\/DOCUMENT-|\/VIDEO-|\.pdf(?:$|[?#])/i.test(value)) return false;

  return /\/PHOTO-/i.test(value) || /\.(jpe?g|png|gif|webp|bmp)(?:$|[?#])/i.test(value);
};

export const getPhotoUrlStatus = async (url, { signal } = {}) => {
  if (!isHttpUrl(url)) {
    return { ok: false, status: 0, url, reason: 'invalid-url' };
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      signal,
    });

    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        url,
        contentType: response.headers.get('content-type') || '',
      };
    }

    return {
      ok: false,
      status: response.status,
      url,
      reason: 'http-error',
      contentType: response.headers.get('content-type') || '',
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      url,
      reason: error && error.name === 'AbortError' ? 'aborted' : 'fetch-error',
      error,
    };
  }
};

export const isReachablePhotoUrl = async (url, options) => {
  const { ok } = await getPhotoUrlStatus(url, options);
  return ok;
};

export const filterExistingPhotoUrls = async (photos = [], { maxPhotos = Number.POSITIVE_INFINITY, signal } = {}) => {
  const results = [];
  const seen = new Set();

  for (const photo of photos || []) {
    const url = typeof photo === 'string' ? photo.trim() : '';
    if (!url || !isHttpUrl(url) || seen.has(url)) continue;

    seen.add(url);

    const { ok } = await getPhotoUrlStatus(url, { signal });
    if (!ok) continue;

    results.push(url);
    if (results.length >= maxPhotos) break;
  }

  return results;
};

export const getPhotoUrls = (value, { maxPhotos = Number.POSITIVE_INFINITY } = {}) => {
  const collected = [];

  const walk = (node) => {
    if (node == null) return;

    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item);
      }
      return;
    }

    if (typeof node === 'string') {
      const text = node.trim();
      if (!text) return;

      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          walk(parsed);
          return;
        }

        if (parsed && typeof parsed === 'object') {
          walk(parsed);
          return;
        }
      } catch {
        // Ignore invalid JSON; fall through to URL extraction.
      }

      const match = text.match(PHOTO_URL_PATTERN);
      if (match) {
        collected.push(match[0]);
      }
      return;
    }

    if (typeof node === 'object') {
      for (const key of PHOTO_KEYS) {
        if (node[key] !== undefined && node[key] !== null) {
          walk(node[key]);
          return;
        }
      }

      for (const nested of Object.values(node)) {
        walk(nested);
      }
    }
  };

  walk(value);
  return sanitizePhotoUrls(collected, { maxPhotos });
};

export const normalizePhotoUrls = (value, options = {}) => getPhotoUrls(value, options);

export const getFirstPhotoUrl = (value) => {
  const [first] = getPhotoUrls(value, { maxPhotos: 1 });
  return first || null;
};
