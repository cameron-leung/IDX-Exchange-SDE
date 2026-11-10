import { useEffect, useMemo, useState } from 'react';
import { normalizePhotoUrls } from '../utils/photoUtils';

const GALLERY_HEIGHT = 480;
const THUMBNAIL_HEIGHT = 96;

export default function PropertyImageGallery({ property, images: incomingImages }) {
  const normalizedImages = useMemo(() => {
    const source = property?.images ?? property?.L_Photos ?? property?.photos ?? property?.Images ?? incomingImages;
    return normalizePhotoUrls(source, { maxPhotos: 50 });
  }, [property, incomingImages]);

  const galleryKey = JSON.stringify(normalizedImages);

  const [images, setImages] = useState(() => normalizedImages);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goToPreviousImage = () => {
    setSelectedImage((currentIndex) => {
      if (!images.length) return 0;
      return currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
    });
  };

  const goToNextImage = () => {
    setSelectedImage((currentIndex) => {
      if (!images.length) return 0;
      return currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
    });
  };

  const removeImageByIndex = (indexToRemove) => {
    setImages((currentImages) => {
      if (!currentImages.length) {
        return currentImages;
      }

      const nextImages = currentImages.filter((_, index) => index !== indexToRemove);

      setSelectedImage((currentSelected) => {
        if (!nextImages.length) {
          return 0;
        }

        if (currentSelected > indexToRemove) {
          return Math.max(currentSelected - 1, 0);
        }

        if (currentSelected === indexToRemove) {
          return Math.min(indexToRemove, nextImages.length - 1);
        }

        return currentSelected;
      });

      return nextImages;
    });
  };

  const activeImage = images[selectedImage] || images[0];
  const showThumbnailList = images.length > 1;

  useEffect(() => {
    if (!isLightboxOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousImage();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  },);

  if (!images.length) {
    return (
      <div style={{
        width: '100%',
        minHeight: '420px',
        borderRadius: '16px',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: '14px',
      }}>
        No property images available
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <>
        <div key={galleryKey} style={{ width: '100%' }}>
          <div style={{
            width: '100%',
            height: `${GALLERY_HEIGHT}px`,
            borderRadius: '18px',
            overflow: 'hidden',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
          }}>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              style={{
                width: '100%',
                height: '100%',
                padding: 0,
                border: 'none',
                background: 'rgb(255, 255, 255, 50%)',
                cursor: 'pointer',
                display: 'block',
              }}
              aria-label="Open photo lightbox"
            >
              <img
                src={activeImage}
                alt="Selected property view"
                onError={() => removeImageByIndex(selectedImage)}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </button>
          </div>
        </div>

        {isLightboxOpen && (
          <div
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.26)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '24px',
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                position: 'relative',
                width: 'min(92vw, 1200px)',
                height: 'min(88vh, 820px)',
                background: 'transparent',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: 'none',
              }}
            >
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Close lightbox"
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  zIndex: 2,
                  border: 'none',
                  borderRadius: '999px',
                  width: '42px',
                  height: '42px',
                  background: 'rgba(0,0,0,0.08)',
                  color: '#000',
                  fontSize: '24px',
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>

              <img
                src={activeImage}
                alt="Property gallery view"
                onError={() => removeImageByIndex(selectedImage)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  background: 'transparent',
                  borderRadius: '20px',
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div key={galleryKey} style={{ display: 'flex', gap: '16px', alignItems: 'stretch', width: '100%', height: `${GALLERY_HEIGHT}px` }}>
        {showThumbnailList && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '120px',
            height: '100%',
            flexShrink: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '4px',
            scrollbarWidth: 'thin',
          }}>
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(index)}
              style={{
                width: '100%',
                height: `${THUMBNAIL_HEIGHT}px`,
                minHeight: `${THUMBNAIL_HEIGHT}px`,
                border: selectedImage === index ? '2px solid #2563eb' : '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                padding: 0,
                background: '#fff',
                cursor: 'pointer',
                boxShadow: selectedImage === index ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
                flexShrink: 0,
              }}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Property view ${index + 1}`}
                onError={() => removeImageByIndex(index)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </button>
          ))}
        </div>
      )}

        <div style={{
          flex: '1 1 auto',
          width: '100%',
          minWidth: 0,
          height: '100%',
          borderRadius: '18px',
          overflow: 'hidden',
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
        }}>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'block',
            }}
            aria-label="Open photo lightbox"
          >
            <img
              src={activeImage}
              alt="Selected property view"
              onError={() => removeImageByIndex(selectedImage)}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'cover',
              }}
            />
          </button>
        </div>
      </div>

      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '24px',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(92vw, 1200px)',
              height: 'min(88vh, 820px)',
              background: 'transparent',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'none',
            }}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close lightbox"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                zIndex: 2,
                border: 'none',
                borderRadius: '999px',
                width: '42px',
                height: '42px',
                background: 'rgba(0,0,0,0.08)',
                color: '#000',
                fontSize: '24px',
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            <button
              type="button"
              onClick={goToPreviousImage}
              aria-label="Previous photo"
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                border: 'none',
                borderRadius: '999px',
                width: '48px',
                height: '48px',
                background: 'rgba(0,0,0,0.08)',
                color: '#111827',
                fontSize: '32px',
                cursor: 'pointer',
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goToNextImage}
              aria-label="Next photo"
              style={{
                position: 'absolute',
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                border: 'none',
                borderRadius: '999px',
                width: '48px',
                height: '48px',
                background: 'rgba(0,0,0,0.08)',
                color: '#111827',
                fontSize: '32px',
                cursor: 'pointer',
              }}
            >
              ›
            </button>

            <img
              src={activeImage}
              alt="Property gallery view"
              onError={() => removeImageByIndex(selectedImage)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                background: 'transparent',
                borderRadius: '20px',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '18px',
                transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '999px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
