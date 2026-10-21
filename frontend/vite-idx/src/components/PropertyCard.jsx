import './PropertyCard.css'

const PropertyCard = ({ property }) => {
  
  //'https://via.placeholder.com/400x250?text=Property Image+Unavailable';
  const getFirstPhoto = (value) => {
    if (!value) return null;

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed[0] || null;
        //return parsed || null;
      } catch {
        return value;
      }
    }
    return null;
  };
  const photo = getFirstPhoto(property?.L_Photos) || 'https://via.placeholder.com/400x250?text=Property Image+Unavailable';
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
