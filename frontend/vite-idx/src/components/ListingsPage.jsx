import { useEffect, useState } from 'react';
import { getProperties } from '../api/properties';
import PropertyCard from './PropertyCard';

const ListingsPage = () => {
    // State to hold the list of properties, loading status, and error message
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadProperties = async () => {
            // Fetch properties from the API and update state
            try {
                const data = await getProperties();
                const results = Array.isArray(data?.results) ? data.results : [];

                if (isMounted) {
                    setItems(results);
                }
            } catch {
                // Handle errors and set error message if server not responding, request rejected, fetch, or network error
                if (isMounted) {
                    setError('Unable to load properties.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProperties();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) return <div>Loading properties...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="listings-page" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
            {items.map((property, index) => (
                <PropertyCard
                    key={property.L_ListingID || property.id || `${property.L_Address || 'property'}-${index}`}
                    property={property}
                />
            ))}
        </div>
    );
};

export default ListingsPage;