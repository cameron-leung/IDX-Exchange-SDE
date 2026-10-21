import './PropertyCard.css'

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x250?text=Property Image+Unavailable';


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
      // not valid JSON, fall through to URL detection below
    }

    const match = text.match(/https?:\/\/[^\s,]+/i);
    return match ? match[0] : null;
  }

  if (typeof value === 'object') {
    return getFirstPhoto(
      value.url || value.src || value.image || value.img || value.photo || value.thumbnail
    );
  }

  return null;
};
const PropertyCard = ({ property }) => {

  // const getFirstPhoto = (value) => {

  //   if (!value) return null;
  //   if (Array.isArray(value)) {
  //     const stripped = strip(value[0]) || getFirstPhoto(value[0]);
  //     if (stripped) return stripped;
  //   }

  //   if (typeof value === 'string') {
  //     const stripped = strip(value);
  //     if (stripped) return stripped;

  //     const match = value.match(/https?:\/\/[^\s,]+/i);
  //     return match ? match[0] : null;
  //   }

  //   if (typeof value === 'object') {
  //     if (typeof value.url === 'string') return strip(value.url);
  //     if (typeof value.src === 'string') return strip(value.src);
  //     if (typeof value.image === 'string') return strip(value.image);
  //     if (Array.isArray(value.images)) return getFirstPhoto(value.images);
  //     if (Array.isArray(value.photos)) return getFirstPhoto(value.photos);
  //   }

  //   return null;
  // }


  const photo = getFirstPhoto(property?.L_Photos) || FALLBACK_IMAGE;
  const address = property?.L_Address || property?.address || 'Address unavailable';
  const city = property?.L_City || property?.city || 'City unavailable';
  const zip = property?.L_Zip || property?.zip || property?.postalCode || 'ZIP unavailable';
  const beds = property?.L_Keyword2 ?? property?.beds ?? '—';
  const baths = property?.LM_Dec_3 ?? property?.baths ?? '—';
  const sqft = property?.LM_Int2_3 ?? property?.sqft ?? '—';
  const price = property?.L_SystemPrice ?? property?.price;
  const formattedPrice = price !== null && price !== undefined && price !== ''
    ? `$${Number(price).toLocaleString()}`
    : 'Price unavailable';

  return (
    <div className = "propertycard">
      <img
        src={photo}
        alt={`${address} ${city}`}
        
      />

      <div style={{ padding: '12px' }}>
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

          <div  id = "details"
          >
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

        <div  id= "address"
        >
          {address}, {city}, {zip}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
