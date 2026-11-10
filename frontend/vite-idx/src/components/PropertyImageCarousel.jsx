import { useMemo, useState } from 'react';
import { isPhotoUrl, normalizePhotoUrls } from '../utils/photoUtils';

const MAX_CAROUSEL_IMAGES = 5;

export default function PropertyImageCarousel({
  property,
  images,
  height = 500,
  borderRadius = 24,
  className = '',
}) {
  const basePhotoList = useMemo(() => {
    const source = property?.L_Photos ?? property?.photos ?? property?.Images ?? images;
    return normalizePhotoUrls(source, { maxPhotos: MAX_CAROUSEL_IMAGES }).filter(isPhotoUrl);
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
    setCurrentIndex((prev) => {
      const normalizedPrev = photoList.length
        ? ((prev % photoList.length) + photoList.length) % photoList.length
        : 0;
      return normalizedPrev === 0 ? photoList.length - 1 : normalizedPrev - 1;
    });
  };

  const goToNext = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => {
      const normalizedPrev = photoList.length
        ? ((prev % photoList.length) + photoList.length) % photoList.length
        : 0;
      return normalizedPrev === photoList.length - 1 ? 0 : normalizedPrev + 1;
    });
  };

  const handleImageError = () => {
    if (!currentImage) return;

    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(currentImage);
      return next;
    });

    setCurrentIndex((prev) => {
      if (photoList.length <= 1) return 0;
      const normalizedPrev = photoList.length
        ? ((prev % photoList.length) + photoList.length) % photoList.length
        : 0;
      return normalizedPrev >= photoList.length - 1 ? 0 : normalizedPrev + 1;
    });
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
