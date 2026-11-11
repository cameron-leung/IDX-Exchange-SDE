import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPropertyById } from '../api/properties';
import { getFirstPhotoUrl } from '../utils/photoUtils';
import PropertyDetailOpenHouse from './PropertyDetailOpenHouse';
import PropertyImageGallery from './PropertyImageGallery';
import PropertyMap from './PropertyMap';

const FALLBACK_IMAGE = 'https://via.placeholder.com/800x500?text=Image+Unavailable';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [openHouseRemarks, setOpenHouseRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const propertyId = property?.L_ListingID ?? property?.id ?? id;

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
          setError(loadError?.message || 'Unable to load property');
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
  const photo = getFirstPhotoUrl(property?.L_Photos) || FALLBACK_IMAGE;
  const latitude = property?.LMD_MP_Latitude;
  const longitude = property?.LMD_MP_Longitude;
  const hasMapCoordinates = latitude != null && longitude != null;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Verdana', textAlign: 'left' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#2563eb', textDecoration: 'none' }}>
        ← Back to listings
      </Link>

      {loading && (
        <div style={{ fontFamily: 'Verdana', color: '#666' }}>Loading property...</div>
      )}

      {error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          <img
            src={FALLBACK_IMAGE}
            alt="Image unavailable"
            style={{
              width: '100%',
              height: '420px',
              objectFit: 'cover',
              borderRadius: '12px',
              background: '#f3f4f6',
              display: 'block',
            }}
          />
          <div style={{ fontFamily: 'Verdana', color: '#666', textAlign: 'left' }}>{error || 'Invalid Property ID'}</div>
        </div>
      )}

      {!loading && !error && !property && (
        <div style={{ fontFamily: 'Verdana', color: '#666' }}>Property not found.</div>
      )}

      {!loading && !error && property && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
          <PropertyImageGallery
            property={property}
            images={Array.isArray(property?.L_Photos) && property.L_Photos.length ? property.L_Photos : [photo]}
            fallbackImage={FALLBACK_IMAGE}
            alt={`${address} ${city}`}
          />

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
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
              </div>

              {propertyId && (
                <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '8px' }}>
                  <PropertyDetailOpenHouse
                    L_listingID={propertyId}
                    onOpenHousesLoaded={setOpenHouseRemarks}
                  />
                </div>
              )}
            </div>


            {(property?.L_Remarks || openHouseRemarks.length > 0) && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>
                  About
                </div>

                <div style={{ flex: '1 1 auto', minWidth: 0, fontSize: '14px', lineHeight: 1.7, color: '#4b5563', textAlign: 'left', maxWidth: '1000px' }}>
                  {property?.L_Remarks && (
                    <div style={{ marginBottom: openHouseRemarks.length > 0 ? '16px' : 0 }}>{property.L_Remarks}</div>
                  )}

                  {openHouseRemarks.length > 0 && (
                    <div style={{ paddingTop: '12px', borderTop: property?.L_Remarks ? '1px solid #e5e7eb' : 'none' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>
                        Open House Remarks
                      </div>

                      {openHouseRemarks.map((remark, index) => (
                        <div key={`${remark}-${index}`} style={{ marginTop: index > 0 ? '8px' : 0 }}>
                          {remark}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasMapCoordinates && (
              <div style={{ width: '100%', paddingTop: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '12px' }}>
                  Map
                </div>
                <PropertyMap
                  property={property}
                  address={address}
                  latitude={latitude}
                  longitude={longitude}
                  width="100%"
                  height="320px"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
