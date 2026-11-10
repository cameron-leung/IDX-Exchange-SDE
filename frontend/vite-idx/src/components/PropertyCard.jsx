import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PropertyCard.css'

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x250?text=Image+Unavailable';
const MAX_PHOTOS = 5;

const sanitizePhotos = (photos) => Array.from(new Set(
  (photos || [])
    .filter((photo) => typeof photo === 'string' && /^https?:\/\//i.test(photo.trim()))
    .map((photo) => photo.trim())
  )
).slice(0, MAX_PHOTOS);

const getPhotos = (value, collected = []) => {
  if (value == null) return collected;

  if (Array.isArray(value)) {
    for (const item of value) {
      getPhotos(item, collected);
    }
    return collected;
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return collected;

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return getPhotos(parsed, collected);
      }

      if (parsed && typeof parsed === 'object') {
        return getPhotos(
          parsed.url || parsed.src || parsed.image || parsed.img || parsed.photo || parsed.thumbnail,
          collected
        );
      }
    } catch {
      // not valid JSON, fall through to URL detection below
    }

    const match = text.match(/https?:\/\/[^\s,]+/i);
    if (match) {
      const photo = match[0];
      if (!collected.includes(photo)) collected.push(photo);
    }
    return collected;
  }

  if (typeof value === 'object') {
    const photo = value.url || value.src || value.image || value.img || value.photo || value.thumbnail || value.href;
    if (photo) return getPhotos(photo, collected);
  }

  return collected;
};

const PropertyPhotoCarousel = ({ photos, address, city, propertyId }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const validPhotos = sanitizePhotos(photos).filter((photo) => !failedUrls.has(photo));
  const photosToShow = validPhotos.length ? validPhotos : [FALLBACK_IMAGE];

  const showPreviousPhoto = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === 0 ? photosToShow.length - 1 : prev - 1));
  };

  const showNextPhoto = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === photosToShow.length - 1 ? 0 : prev + 1));
  };

  const currentPhoto = photosToShow[currentPhotoIndex] || FALLBACK_IMAGE;

  const handlePhotoError = (event, photoIndex) => {
    const failedPhoto = photosToShow[photoIndex] || currentPhoto;

    if (!failedPhoto) {
      event.currentTarget.src = FALLBACK_IMAGE;
      return;
    }

    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(failedPhoto);
      return next;
    });

    setCurrentPhotoIndex(0);
    event.currentTarget.src = sanitizePhotos(photos).find((photo) => !failedUrls.has(photo)) || FALLBACK_IMAGE;
    event.currentTarget.onerror = null;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '250px', overflow: 'hidden', background: '#f5f5f5' }}>
      <img
        src={currentPhoto}
        alt={`${address} ${city}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(event) => handlePhotoError(event, currentPhotoIndex)}
      />

      {photosToShow.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPreviousPhoto}
            aria-label="Previous property photo"
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '26px',
              fontWeight: 700,
              lineHeight: '1',
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={showNextPhoto}
            aria-label="Next property photo"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '26px',
              fontWeight: 700,
              lineHeight: '1',
            }}
          >
            ›
          </button>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '10px',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            {photosToShow.map((_, index) => (
              <span
                key={`${propertyId || 'property'}-${index}`}
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: index === currentPhotoIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
                }}
              />
            ))}
          </div>
        </>
      )}

      <div
        style={{
          position: 'absolute',
          right: '8px',
          bottom: '8px',
          color: '#fff',
          fontSize: '10px',
          lineHeight: 1,
          fontWeight: 700,
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
        }}
      >
        {photosToShow.length > 0 ? `${currentPhotoIndex + 1}/${photosToShow.length}` : '0/0'}
      </div>
    </div>
  );
};

const PropertyCard = ({ property }) => {
  const propertyImages = sanitizePhotos(getPhotos(property?.L_Photos));
  const photos = propertyImages.slice(0, MAX_PHOTOS);

  const address = property?.L_Address || property?.address || 'Address unavailable';
  const city = property?.L_City || property?.city || 'City unavailable';
  const zip = property?.L_Zip || property?.zip || property?.postalCode || 'ZIP unavailable';
  const beds = property?.L_Keyword2 ?? property?.beds ?? '—';
  const baths = property?.LM_Dec_3 ?? property?.baths ?? '—';
  const sqft = property?.LM_Int2_3 ?? property?.sqft ?? '—';
  const price = property?.L_SystemPrice ?? property?.price;
  const propertyId = property?.L_ListingID ?? '';
  const formattedPrice = price !== null && price !== undefined && price !== ''
    ? `$${Number(price).toLocaleString()}`
    : 'Price unavailable';

  return (
    <Link to={propertyId ? `/property/${propertyId}` : '/'} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="propertycard">
        <PropertyPhotoCarousel
          key={propertyId || `${address}-${city}-${zip}`}
          photos={photos}
          address={address}
          city={city}
          propertyId={propertyId}
        />

        <div style={{ padding: '10px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'baseline',
              marginBottom: '8px',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{formattedPrice}</div>

            <div id="details">
              <span>
                {beds} beds |
              </span>
              <span>
                {baths} baths |
              </span>
              <span>
                {sqft} sqft
              </span>
            </div>
          </div>

          <div id="address">
            {address}, {city}, {zip}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
