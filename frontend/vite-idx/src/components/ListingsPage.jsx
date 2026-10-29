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
    const [filters, setFilters] = useState({
        city: '',
        zipcode: '',
        beds: '',
        baths: '',
        minPrice: '',
        maxPrice: '',
    });

    useEffect(() => {
        let isMounted = true;

        const loadProperties = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getProperties(filters);
                const results = Array.isArray(data?.results) ? data.results : [];
                const total = data?.total ?? 0;
                const count = results.length;

                if (isMounted) {
                    setItems(results);
                    setTotal(total);
                    setCount(count);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError, 'Unable to load properties.');
                    setItems([]);
                    setTotal(0);
                    setCount(0);
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
    }, [filters]);

    const handleFiltersApply = (nextFilters) => {
        setFilters({
            city: nextFilters.city || '',
            zipcode: nextFilters.zipcode || '',
            minPrice: nextFilters.minPrice || '',
            maxPrice: nextFilters.maxPrice || '',
            beds: nextFilters.beds || '',
            baths: nextFilters.baths || '',
        });
    };

    if (loading) return <div>Loading properties...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div> 
            <div style = {{display: 'flex', justifyContent: 'flex-end', padding: '20px 20px'}}>
                <PropertyFilters onApply={handleFiltersApply} initialFilters={filters} />
        </div>
        <div className="listings-page" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '20px' }}>
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