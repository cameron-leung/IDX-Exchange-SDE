import { useEffect, useState } from 'react';
import { getProperties } from '../api/properties';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';

const ListingsPage = () => {
    // State to hold the list of properties, loading status, and error message
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadProperties = async () => {
            // Fetch properties from the API and update state
            try {
                const data = await getProperties();
                const results = Array.isArray(data?.results) ? data.results : [];
                const total = data?.total ?? 0;
                const count = results.length;

                if (isMounted) {
                    setItems(results);
                    setTotal(total);
                    setCount(count);
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
        <div> 
            <div style = {{display: 'flex', justifyContent: 'flex-end', padding: '20px 20px'}}>
                <PropertyFilters />
        </div>
        <div className="listings-page" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '50px' }}>
            {items.map((property, index) => (
                <PropertyCard
                    key={property.L_ListingID || property.id || `${property.L_Address || 'property'}-${index}`}
                    property={property}
                />
            ))}
        </div>
         <p style = {{textAlign: 'center', fontFamily: 'Verdana'}}> Showing {count} of {total} </p>
         </div>
         
    );
};

export default ListingsPage;