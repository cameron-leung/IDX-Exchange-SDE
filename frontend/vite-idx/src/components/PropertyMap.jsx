import 'react';

export default function PropertyMap({
  property,
  address,
  latitude,
  longitude,
  apiKey,
  width = '100%',
  height = '320px',
  className = '',
  title = 'Property location',
  zoom = 14,
}) {
  const hasCoordinates = latitude != null && longitude != null;

  if (!hasCoordinates) {
    return null;
  }

  const locationQuery =
    property?.address ||
    address ||
    `${latitude},${longitude}`;

  const query = encodeURIComponent(locationQuery);

  const embedUrl = apiKey
    ? hasCoordinates
      ? `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(apiKey)}&center=${latitude},${longitude}&zoom=${zoom}`
      : `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${query}`
    : hasCoordinates
      ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`
      : `https://maps.google.com/maps?q=${query}&z=${zoom}&output=embed`;

  const mapLink = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps?q=${query}`;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', height, background: '#e5e7eb' }}>
        <iframe
          title={title}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <a
        href={mapLink}
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          background: 'rgba(255,255,255,0.9)',
          color: '#374151',
          fontSize: 14,
          textDecoration: 'underline',
          padding: '6px 10px',
          borderRadius: 999,
          fontFamily: 'Verdana',
        }}
      >
        Get Directions
      </a>
    </div>
  );
}
