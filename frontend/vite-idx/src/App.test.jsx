import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import PropertyCard from './components/PropertyCard.jsx';
//import PropertyImageCarousel from './components/PropertyImageCarousel.jsx';
import * as propertiesApi from './api/properties.js';

vi.mock('./api/properties.js', () => ({
  getProperties: vi.fn(),
  getPropertyById: vi.fn(),
}));

describe('App routing', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    propertiesApi.getProperties.mockResolvedValue({
      results: [
        {
          L_ListingID: 'abc-123',
          L_Address: '123 Main St',
          L_City: 'Seattle',
          L_Zip: '98101',
          L_SystemPrice: 750000,
          L_Keyword2: 3,
          LM_Dec_3: 2,
          LM_Int2_3: 1800,
        },
      ],
      total: 1,
    });

    propertiesApi.getPropertyById.mockResolvedValue({
      id: 'abc-123',
      L_Address: '123 Main St',
      L_City: 'Seattle',
      L_Zip: '98101',
      L_SystemPrice: 750000,
      L_Keyword2: 3,
      LM_Dec_3: 2,
      LM_Int2_3: 1800,
    });
  });

  it('renders the listings page at the root route', async () => {
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(await screen.findByText(/Discover the perfect home you'd love to live in\./i)).toBeTruthy();
  });

  it('renders the property detail page for /property/:id', async () => {
    window.history.pushState({}, '', '/property/abc-123');

    render(<App />);

    await waitFor(() => {
      expect(propertiesApi.getPropertyById).toHaveBeenCalledWith('abc-123');
    });

    expect(await screen.findByText(/Property Details/i)).toBeTruthy();
  });

  it('resets to the original first photo and hides the carousel controls when only one valid image remains', async () => {
    const firstPhoto = 'https://example.com/first.jpg';
    const brokenSecondPhoto = 'https://example.com/broken.jpg';

    render(
      <MemoryRouter>
        <PropertyCard
          property={{
            L_ListingID: 'abc-456',
            L_Address: '456 Oak Ave',
            L_City: 'Portland',
            L_Zip: '97205',
            L_SystemPrice: 500000,
            L_Keyword2: 2,
            LM_Dec_3: 1,
            LM_Int2_3: 1000,
            L_Photos: [firstPhoto, brokenSecondPhoto],
          }}
        />
      </MemoryRouter>,
    );

    const image = screen.getByRole('img', { name: /456 oak ave portland/i });
    fireEvent.click(screen.getByRole('button', { name: /next property photo/i }));
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /456 oak ave portland/i }).getAttribute('src')).toBe(firstPhoto);
    });

    expect(screen.queryByRole('button', { name: /next property photo/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /previous property photo/i })).toBeNull();
  });
});
