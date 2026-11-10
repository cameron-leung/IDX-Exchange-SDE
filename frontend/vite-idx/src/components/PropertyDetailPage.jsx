import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPropertyById } from '../api/properties';

const FALLBACK_IMAGE = 'https://via.placeholder.com/800x500?text=Image+Unavailable';

const isPhotoUrl = (value) => {
  if (typeof value !== 'string') return false;

  const trim = value.trim();
  if (!trim || !/^https?:\/\//i.test(trim)) return false;
  if (/\/DOCUMENT-|\/VIDEO-|\.pdf(?:$|[?#])/i.test(trim)) return false;

  return /\/PHOTO-/i.test(trim) || /\.(jpe?g|png|gif|webp|bmp)(?:$|[?#])/i.test(trim);
};

const getFirstPhoto = (value) => {
  if (value == null) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const photo = getFirstPhoto(item);
      if (photo) return photo;
    }
    return null;
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return getFirstPhoto(parsed);
      }

      if (parsed && typeof parsed === 'object') {
        return getFirstPhoto(parsed.url || parsed.src || parsed.image || parsed.img || parsed.photo);
      }
    } catch {
      // Ignore invalid JSON and fall back to URL extraction below.
    }

    const match = text.match(/https?:\/\/[^\s,]+/i);
    if (!match) return null;

    const photoUrl = match[0];
    return isPhotoUrl(photoUrl) ? photoUrl : null;
  }

  if (typeof value === 'object') {
    return getFirstPhoto(
      value.url || value.src || value.image || value.img || value.photo || value.thumbnail
    );
  }

  return null;
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getPropertyById(id);
        if (isMounted) {
          setProperty(result);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.message || 'Unable to load property details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProperty();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const address = property?.L_Address || property?.address || 'Address unavailable';
  const city = property?.L_City || property?.city || 'City unavailable';
  const zip = property?.L_Zip || property?.zip || property?.postalCode || 'ZIP unavailable';
  const price = property?.L_SystemPrice ?? property?.price;
  const formattedPrice = price !== null && price !== undefined && price !== ''
    ? `$${Number(price).toLocaleString()}`
    : 'Price unavailable';
  const yearBuilt = property?.YearBuilt || '—';
  const specs = [
    { label: 'Beds', value: property?.L_Keyword2 ?? property?.beds ?? '—' },
    { label: 'Baths', value: property?.LM_Dec_3 ?? property?.baths ?? '—' },
    { label: 'Sqft', value: property?.LM_Int2_3 ?? property?.sqft ?? '—' },
    { label: 'Year Built', value: yearBuilt },
  ];
  const photo = getFirstPhoto(property?.L_Photos) || FALLBACK_IMAGE;

  if (loading) {
    return <div style={{ padding: '32px', fontFamily: 'Verdana', color: '#666' }}>Loading property...</div>;
  }

  if (error) {
    return <div style={{ padding: '32px', fontFamily: 'Verdana', color: '#666' }}>{error}</div>;
  }

  if (!property) {
    return <div style={{ padding: '32px', fontFamily: 'Verdana', color: '#666' }}>Property not found.</div>;
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Verdana', textAlign: 'left' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#2563eb', textDecoration: 'none' }}>
        ← Back to listings
      </Link>



      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
        <img
          src={photo}
          alt={`${address} ${city}`}
          style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '16px' }}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.2, color: '#111827' }}>{formattedPrice}</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '18px', lineHeight: 1.5, color: '#374151' }}>
            {specs.map((spec, index) => (
              <div key={spec.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {index > 0 && <span style={{ color: '#9ca3af' }}>|</span>}
                <span>
                  {spec.label}: {spec.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '18px', lineHeight: 1.5, color: '#374151', textAlign: 'left' }}>
            {address}
            {city ? `, ${city}` : ''}
            {zip ? ` ${zip}` : ''}
          </div>

          {property?.L_Remarks && (
            <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#4b5563', textAlign: 'left', maxWidth: '1000px' }}>
              {property.L_Remarks}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
