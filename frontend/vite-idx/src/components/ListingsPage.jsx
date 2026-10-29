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

    const sanitizeFilters = (rawFilters = {}) => {
        const cleaned = {
            city: '',
            zipcode: '',
            beds: '',
            baths: '',
            minPrice: '',
            maxPrice: '',
        };

        Object.entries(rawFilters).forEach(([key, value]) => {
            const normalized = typeof value === 'string' ? value.trim() : value;

            if (key === 'city') {
                if (normalized === '' || normalized === null || normalized === undefined) {
                    cleaned.city = '';
                    return;
                }

                const cityValue = String(normalized);
                const safeCity = cityValue.replace(/[^a-zA-Z\s'-]/g, '').slice(0, 100);
                cleaned.city = safeCity.trim();

                if (!safeCity.trim() || /\d/.test(cityValue)) {
                    cleaned.city = '';
                }
                return;
            }

            if (key === 'zipcode') {
                if (normalized === '' || normalized === null || normalized === undefined) {
                    cleaned.zipcode = '';
                    return;
                }

                const zipValue = String(normalized).replace(/[^0-9A-Za-z-]/g, '').slice(0, 10);
                cleaned.zipcode = zipValue.trim();
                return;
            }

            if (normalized === '' || normalized === null || normalized === undefined) {
                cleaned[key] = '';
                return;
            }

            const numericValue = Number(normalized);
            if (Number.isFinite(numericValue) && numericValue >= 0) {
                cleaned[key] = String(normalized);
            }
        });

        return cleaned;
    };

    useEffect(() => {
        let isMounted = true;

        const loadProperties = async () => {
            const safeFilters = sanitizeFilters(filters);
            //const hasUsableFilters = Object.values(safeFilters).some((value) => String(value).trim() !== '');
            const normalizedFilters = { ...safeFilters };
            const hasInvalidCity =
                filters?.city !== undefined &&
                filters?.city !== null &&
                String(filters.city).trim() !== '' &&
                !safeFilters.city;

            setLoading(true);
            setError('');

            if (hasInvalidCity) {
                if (isMounted) {
                    setItems([]);
                    setTotal(0);
                    setCount(0);
                    setError('');
                    setLoading(false);
                }
                return;
            }

            try {
                const data = await getProperties(normalizedFilters);
                const results = Array.isArray(data?.results) ? data.results : [];
                const total = data?.total ?? 0;
                const count = results.length;

                if (isMounted) {
                    setItems(results);
                    setTotal(total);
                    setCount(count);
                }
            } catch (loadError) {
                const status = loadError?.response?.status ?? loadError?.status;
                const responseMessage = String(
                    loadError?.response?.data?.message ||
                    loadError?.response?.data?.error ||
                    loadError?.message ||
                    ''
                ).toLowerCase();
                const message = String(loadError?.message || '').toLowerCase();
                const hasFilterValues = Boolean(safeFilters.city || safeFilters.zipcode || safeFilters.beds || safeFilters.baths || safeFilters.minPrice || safeFilters.maxPrice);
                const isBadRequest =
                    status === 400 ||
                    status === 422 ||
                    /invalid|bad request|required|numeric|city|zipcode|filter/.test(responseMessage) ||
                    /invalid|bad request|required|numeric|city|zipcode|filter/.test(message) ||
                    (status === 500 && hasFilterValues && /api request failed/.test(message));

                if (isMounted) {
                    if (isBadRequest) {
                        setItems([]);
                        setTotal(0);
                        setCount(0);
                        setError('');
                    } else {
                        setError(loadError?.message || 'Unable to load properties.');
                        setItems([]);
                        setTotal(0);
                        setCount(0);
                    }
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
        const safeFilters = sanitizeFilters(nextFilters);

        setFilters({
            city: safeFilters.city || '',
            zipcode: safeFilters.zipcode || '',
            minPrice: Number(safeFilters.minPrice) === 0 ? '' : safeFilters.minPrice || '',
            maxPrice: Number(safeFilters.maxPrice) === 0 ? '' : safeFilters.maxPrice || '',
            beds: Number(safeFilters.beds) === 0 ? '' : safeFilters.beds || '',
            baths: Number(safeFilters.baths) === 0 ? '' : safeFilters.baths || '',
        });
    };

    const renderListingContent = () => {
        if (loading) {
            return (
                <p style={{ width: '100%', textAlign: 'center', fontFamily: 'Verdana', color: '#666' }}>
                    Loading properties...
                </p>
            );
        }

        if (error) {
            return (
                <p style={{ width: '100%', textAlign: 'center', fontFamily: 'Verdana', color: '#666' }}>
                    {error}
                </p>
            );
        }

        if (items.length > 0) {
            return items.map((property, index) => (
                <PropertyCard
                    key={property.L_ListingID || property.id || `${property.L_Address || 'property'}-${index}`}
                    property={property}
                />
            ));
        }

        return (
            <p style={{ width: '100%', textAlign: 'center', fontFamily: 'Verdana', color: '#666' }}>
                No properties found.
            </p>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px' }}>
                <PropertyFilters onApply={handleFiltersApply} initialFilters={filters} />
            </div>

            <div className="listings-page" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '20px' }}>
                {renderListingContent()}
            </div>

            {!loading && !error && (
                <p style={{ textAlign: 'center', fontFamily: 'Verdana' }}>Showing {count} of {total}</p>
            )}
        </div>
    );
};

export default ListingsPage;