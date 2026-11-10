import { useMemo, useState } from 'react';

const MAX_CAROUSEL_IMAGES = 5;

const isPhotoUrl = (url) => {
  if (typeof url !== 'string') return false;

  const value = url.trim();
  if (!value || !/^https?:\/\//i.test(value)) return false;
  if (/\/DOCUMENT-|\/VIDEO-|\.pdf(?:$|[?#])/i.test(value)) return false;

  return /\/PHOTO-/i.test(value) || /\.(jpe?g|png|gif|webp|bmp)(?:$|[?#])/i.test(value);
};

const getUrlFromPhoto = (photo) => {
  if (!photo) return null;

  if (typeof photo === 'string') {
    const value = photo.trim();
    return value || null;
  }

  if (Array.isArray(photo)) {
    return getUrlFromPhoto(photo[0]);
  }

  if (typeof photo === 'object') {
    if (Array.isArray(photo.L_Photos)) {
      return getUrlFromPhoto(photo.L_Photos[0]);
    }

    if (Array.isArray(photo.photos)) {
      return getUrlFromPhoto(photo.photos[0]);
    }

    const directUrl =
      photo.url ??
      photo.src ??
      photo.href ??
      photo.imageUrl ??
      photo.imageURL ??
      photo.ImageUrl;

    if (typeof directUrl === 'string' && directUrl.trim()) {
      return directUrl.trim();
    }
  }

  return null;
};

const normalizePhotos = (rawPhotos) => {
  if (!rawPhotos) return [];

  let photos = rawPhotos;

  if (typeof photos === 'string') {
    try {
      const parsed = JSON.parse(photos);
      photos = parsed;
    } catch {
      photos = [photos];
    }
  }

  if (!Array.isArray(photos)) {
    if (photos && typeof photos === 'object') {
      photos = photos.L_Photos ?? photos.photos ?? photos.images ?? photos.Images ?? [];
    } else {
      return [];
    }
  }

  const urls = photos
    .map((photo) => getUrlFromPhoto(photo))
    .filter((url) => isPhotoUrl(url));

  return [...new Set(urls)].slice(0, MAX_CAROUSEL_IMAGES);
};

export default function PropertyImageCarousel({
  property,
  images,
  height = 420,
  borderRadius = 24,
  className = '',
}) {
  const basePhotoList = useMemo(() => {
    const source = property?.L_Photos ?? property?.photos ?? property?.Images ?? images;
    return normalizePhotos(source);
  }, [property, images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState(() => new Set());

  const photoList = useMemo(
    () => basePhotoList.filter((url) => !failedUrls.has(url)),
    [basePhotoList, failedUrls],
  );

  const safeCurrentIndex = photoList.length
    ? ((currentIndex % photoList.length) + photoList.length) % photoList.length
    : 0;

  const currentImage = photoList[safeCurrentIndex] ?? photoList[0];

  const hasMultipleImages = photoList.length > 1;

  const goToPrevious = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev === 0 ? photoList.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev === photoList.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = () => {
    if (!currentImage) return;

    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(currentImage);
      return next;
    });
    setCurrentIndex(0);
  };

  if (!photoList.length) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        background: '#e5e7eb',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      <img
        src={currentImage}
        alt="Property"
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0.02))',
        }}
      />

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous image"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              border: 'none',
              background: 'transparent',
              color: '#fff',
              fontSize: '22px',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              boxShadow: 'none',
              borderRadius: 0,
              padding: 0,
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Next image"
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              border: 'none',
              background: 'transparent',
              color: '#fff',
              fontSize: '22px',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              boxShadow: 'none',
              borderRadius: 0,
              padding: 0,
            }}
          >
            ›
          </button>
        </>
      )}

      {hasMultipleImages && (
        <div
          style={{
            position: 'absolute',
            left: '14px',
            bottom: '14px',
            background: 'rgba(255,255,255,0.9)',
            color: '#111827',
            borderRadius: '999px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            zIndex: 2,
            boxShadow: '0 8px 16px rgba(15, 23, 42, 0.1)',
          }}
        >
          {safeCurrentIndex + 1} / {photoList.length}
        </div>
      )}
    </div>
  );
}
