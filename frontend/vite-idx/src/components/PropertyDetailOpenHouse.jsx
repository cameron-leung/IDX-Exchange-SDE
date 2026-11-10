import { useEffect, useReducer } from 'react';
import { getPropertyOpenHouses } from '../api/properties';

const initialState = {
  openHouses: [],
  loading: true,
  error: '',
};

function openHouseReducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { openHouses: [], loading: false, error: '' };
    case 'LOADING':
      return { ...state, loading: true, error: '' };
    case 'SUCCESS':
      return { openHouses: action.payload, loading: false, error: '' };
    case 'ERROR':
      return { openHouses: [], loading: false, error: action.payload };
    default:
      return state;
  }
}

const cleanOpenHouseDate = (value) => {
  if (!value && value !== 0) {
    return '';
  }

  const raw = String(value).trim();
  if (!raw) {
    return '';
  }

  const match = raw.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/);
  if (match) {
    return match[0];
  }

  const firstLetterIndex = raw.search(/[A-Za-z]/);
  if (firstLetterIndex > 0) {
    return raw.slice(0, firstLetterIndex).trim();
  }

  return raw;
};

const formatTimeToAmPm = (value) => {
  if (!value && value !== 0) {
    return '';
  }

  const raw = String(value).trim();
  if (!raw) {
    return '';
  }

  const normalized = raw.replace(/UTC|GMT/gi, '').replace(/\s+/g, ' ').trim();
  const timeMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?/i);

  if (!timeMatch) {
    return normalized;
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2] || 0);
  const meridiem = (timeMatch[4] || '').toUpperCase();

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }
  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }

  const displayHours = hours % 12 || 12;
  const suffix = meridiem || (hours >= 12 ? 'PM' : 'AM');

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const parseAllData = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  return null;
};

const getOpenHouseRemarks = (item) => {
  const directRemarks = item?.OpenHouseRemarks || item?.openHouseRemarks || item?.open_house_remarks;
  if (directRemarks) {
    return String(directRemarks).trim();
  }

  const allData = parseAllData(item?.all_data || item?.allData || item?.All_Data);
  const nestedRemarks = allData?.OpenHouseRemarks || allData?.openHouseRemarks || allData?.open_house_remarks;
  if (nestedRemarks) {
    return String(nestedRemarks).trim();
  }

  return '';
};

const PropertyDetailOpenHouse = ({ L_listingID, onOpenHousesLoaded }) => {
  const [state, dispatch] = useReducer(openHouseReducer, initialState);
  const { openHouses, loading, error } = state;

  useEffect(() => {
    if (!L_listingID) {
      dispatch({ type: 'RESET' });
      return;
    }

    let isMounted = true;

    const fetchOpenHouses = async () => {
      try {
        if (!isMounted) {
          return;
        }

        dispatch({ type: 'LOADING' });

        const data = await getPropertyOpenHouses(L_listingID);
        const items = Array.isArray(data) ? data : data?.results || data?.data || [];

        if (onOpenHousesLoaded) {
          const remarks = items
            .map((item) => getOpenHouseRemarks(item))
            .filter(Boolean);

          onOpenHousesLoaded(remarks);
        }

        if (isMounted) {
          dispatch({ type: 'SUCCESS', payload: items });
        }
      } catch (err) {
        console.error('Error fetching open houses:', err);

        if (isMounted) {
          dispatch({ type: 'ERROR', payload: 'Open house information unavailable' });
        }
      }
    };

    fetchOpenHouses();

    return () => {
      isMounted = false;
    };
  }, [L_listingID]);

  if (loading) {
    return (
      <div style={styles.card}>
        <div>Loading open house...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.card}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  if (!openHouses.length) {
    return null;
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.card}>
        <div style={styles.heading}>Open House</div>

        <div style={styles.wrapper}>
          {openHouses.map((item, index) => {
            const openHouseDate = cleanOpenHouseDate(item.OpenHouseDate || item.openHouseDate || item.date);
            const startTime = formatTimeToAmPm(item.OH_StartTime || item.oh_starttime || item.startTime);
            const endTime = formatTimeToAmPm(item.OH_EndTime || item.oh_endtime || item.endTime);

            return (
              <div key={`${openHouseDate}-${startTime}-${endTime}-${index}`} style={styles.item}>
                <div style={styles.date}>{openHouseDate}</div>
                <div style={styles.timeRow}>
                  {startTime && endTime ? `${startTime} – ${endTime}` : 'Time unavailable'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    flex: '0 0 200px',
    width: '200px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    minHeight: '55px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '10px 12px 12px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
  },
  heading: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '0',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingTop: '0',
  },
  date: {
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: 1.3,
    color: '#111827',
  },
  timeRow: {
    fontSize: '18px',
    lineHeight: 1.4,
    color: '#374151',
    fontWeight: 400,
  },
  error: {
    color: '#b91c1c',
    fontSize: '0.95rem',
  },
};

export default PropertyDetailOpenHouse;
