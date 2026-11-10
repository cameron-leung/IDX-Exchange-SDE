import { useMemo, useState } from 'react';
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

  const activeImage = images[selectedImage] || images[0];
  const showThumbnailList = images.length > 1;

  if (images.length === 1) {
    return (
      <div key={galleryKey} style={{ width: '100%' }}>
        <div style={{
          width: '100%',
          height: `${GALLERY_HEIGHT}px`,
          borderRadius: '18px',
          overflow: 'hidden',
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
        }}>
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
        </div>
      </div>
    );
  }

  return (
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
      </div>
    </div>
  );
}
