import { useEffect, useRef, useState } from "react";
import "./PropertyFilters.css";

const PRICE_STEP = 5000;
const MAX_PRICE = 50000000;

const PropertyFilters = ({ onApply, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [city, setCity] = useState(initialFilters.city ?? "");
  const [zipcode, setZipcode] = useState(initialFilters.zipcode ?? initialFilters.zip ?? "");
  const [beds, setBeds] = useState(initialFilters.beds ?? "");
  const [baths, setBaths] = useState(initialFilters.baths ?? "");
  const [minPrice, setMinPrice] = useState(Number(initialFilters.minPrice ?? 0));
  const [maxPrice, setMaxPrice] = useState(Number(initialFilters.maxPrice ?? MAX_PRICE));
  const [draggingHandle, setDraggingHandle] = useState(null);
  const [filterError, setFilterError] = useState("");
  const sliderRef = useRef(null);

  const handleMinChange = (value) => {
    const nextValue = Number(value);
    if (nextValue <= maxPrice) {
      setMinPrice(nextValue);
    } else {
      setMinPrice(maxPrice);
    }
  };

  const handleMaxChange = (value) => {
    const nextValue = Number(value);
    if (nextValue >= minPrice) {
      setMaxPrice(nextValue);
    } else {
      setMaxPrice(minPrice);
    }
  };

  const resetFilters = () => {
    setCity("");
    setZipcode("");
    setBeds("");
    setBaths("");
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setFilterError("");
  };

  const validateFilters = (filters) => {
    const cityValue = filters.city?.trim();

    if (cityValue) {
      if (/\d/.test(cityValue) || /[!@#$%^&*()_+=[\]{}|\\:";<>?/~`]/.test(cityValue)) {
        return "No properties found";
      }

      if (!/^[\p{L}\p{M}\s.'’\-&/]+$/u.test(cityValue)) {
        return "No properties found";
      }
    }

    if (filters.zipcode && !/^\d{1,10}$/.test(filters.zipcode)) {
      return "No properties found";
    }

    const beds = Number(filters.beds);
    const baths = Number(filters.baths);
    const minPriceValue = Number(filters.minPrice);
    const maxPriceValue = Number(filters.maxPrice);

    if (filters.beds && (!Number.isFinite(beds) || beds < 0 || beds > 15)) {
      return "No properties found";
    }

    if (filters.baths && (!Number.isFinite(baths) || baths < 0 || baths > 20)) {
      return "No properties found";
    }

    if (filters.minPrice !== "" && (!Number.isFinite(minPriceValue) || minPriceValue < 0)) {
      return "No properties found";
    }

    if (filters.maxPrice !== "" && (!Number.isFinite(maxPriceValue) || maxPriceValue < 0)) {
      return "No properties found";
    }

    if (filters.minPrice !== "" && filters.maxPrice !== "" && minPriceValue > maxPriceValue) {
      return "No properties found";
    }

    return "";
  };

  useEffect(() => {
    if (!draggingHandle) return;

    const handlePointerMove = (event) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const relativeX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
      const nextValue = Math.round((relativeX / rect.width) * MAX_PRICE / PRICE_STEP) * PRICE_STEP;

      if (draggingHandle === "min") {
        handleMinChange(Math.max(0, Math.min(nextValue, maxPrice)));
      }

      if (draggingHandle === "max") {
        handleMaxChange(Math.max(minPrice, Math.min(nextValue, MAX_PRICE)));
      }
    };

    const handlePointerUp = () => setDraggingHandle(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  });

  const applyFilters = () => {
    const nextFilters = {
      city: city.trim() || "",
      zipcode: zipcode.trim() || "",
      beds: beds || "",
      baths: baths || "",
      minPrice: minPrice === 0 ? "" : minPrice,
      maxPrice: maxPrice === MAX_PRICE ? "" : maxPrice,
    };

    const errorMessage = validateFilters(nextFilters);
    setFilterError(errorMessage);

    if (errorMessage) {
      return;
    }

    onApply?.(nextFilters);
    setIsOpen(false);
  };

  return (
    <div
      className="property-filters-wrapper"
      style={{
        "--property-grid-columns": "4",
        "--property-page-side-margin": "12px",
        "--property-card-padding": "8px",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="property-filters-button"
        aria-label="Open property filters"
      >
        <span className="property-filters-icon">☰</span>
        Filters
      </button>

      {isOpen && (
        <div className="property-filters-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="property-filters-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="property-filters-header">
              <h3 className="property-filters-title">Property Filters</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="property-filters-close-button"
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            <div className="property-filters-section">
              <label className="property-filters-label">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className="property-filters-input"
              />
            </div>

            <div className="property-filters-section">
              <label className="property-filters-label">Zipcode</label>
              <input
                type="text"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="Enter zipcode"
                className="property-filters-input"
              />
            </div>

            <div className="property-filters-section">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <div>
                  <label className="property-filters-label">Beds</label>
                  <select
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="property-filters-input"
                    style={{ width: "100%" }}
                  >
                    <option value="">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                  </select>
                </div>

                <div>
                  <label className="property-filters-label">Baths</label>
                  <select
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    className="property-filters-input"
                    style={{ width: "100%" }}
                  >
                    <option value="">None</option>
                    <option value="0.5">0.5</option>
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="2.5">2.5</option>
                    <option value="3">3</option>
                    <option value="3.5">3.5</option>
                    <option value="4">4</option>
                    <option value="4.5">4.5</option>
                    <option value="5">5</option>
                    <option value="5.5">5.5</option>
                    <option value="6">6</option>
                    <option value="6.5">6.5</option>
                    <option value="7">7</option>
                    <option value="7.5">7.5</option>
                    <option value="8">8</option>
                    <option value="8.5">8.5</option>
                    <option value="9">9</option>
                    <option value="9.5">9.5</option>
                    <option value="10">10</option>
                    <option value="10.5">10.5</option>
                    <option value="11">11</option>
                    <option value="11.5">11.5</option>
                    <option value="12">12</option>
                    <option value="12.5">12.5</option>
                    <option value="13">13</option>
                    <option value="13.5">13.5</option>
                    <option value="14">14</option>
                    <option value="14.5">14.5</option>
                    <option value="15">15</option>
                    <option value="15.5">15.5</option>
                    <option value="16">16</option>
                    <option value="16.5">16.5</option>
                    <option value="17">17</option>
                    <option value="17.5">17.5</option>
                    <option value="18">18</option>
                    <option value="18.5">18.5</option>
                    <option value="19">19</option>
                    <option value="19.5">19.5</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="property-filters-section">
              <div className="property-filters-price-header">
                <label className="property-filters-label">Price Range</label>
                <span className="property-filters-range-value">
                  ${minPrice} - ${maxPrice}
                </span>
              </div>

              <div
                ref={sliderRef}
                className="property-filters-slider-group"
                style={{ position: "relative", padding: "16px 0 8px", height: 28 }}
              >
                <div
                  id="full-slider-track"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "100%",
                    height: 6,
                    transform: "translateY(-50%)",
                    borderRadius: 999,
                    background: "#e5e7eb",
                  }}
                />
                <div
                  id="selected-slider-track"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${(minPrice / MAX_PRICE) * 100}%`,
                    width: `${((maxPrice - minPrice) / MAX_PRICE) * 100}%`,
                    height: 6,
                    transform: "translateY(-50%)",
                    borderRadius: 999,
                    background: "#4287f7",
                  }}
                />

                <div
                  aria-label="Minimum price"
                  aria-valuemin={0}
                  aria-valuemax={MAX_PRICE}
                  aria-valuenow={minPrice}
                  role="slider"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setDraggingHandle("min");
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${(minPrice / MAX_PRICE) * 100}%`,
                    width: 16,
                    height: 16,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2px solid #4287f7",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                    zIndex: draggingHandle === "min" ? 5 : 3,
                    cursor: "grab",
                  }}
                />

                <div
                  aria-label="Maximum price"
                  aria-valuemin={0}
                  aria-valuemax={MAX_PRICE}
                  aria-valuenow={maxPrice}
                  role="slider"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setDraggingHandle("max");
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${(maxPrice / MAX_PRICE) * 100}%`,
                    width: 16,
                    height: 16,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2px solid #4287f7",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                    zIndex: draggingHandle === "max" ? 5 : 4,
                    cursor: "grab",
                  }}
                />
              </div>
            </div>

            {filterError && (
              <div className="property-filters-error" style={{ color: "#dc2626", marginTop: 12, fontSize: 14 }}>
                No properties found
              </div>
            )}

            <div className="property-filters-actions">
              <button type="button" onClick={resetFilters} className="property-filters-secondary-button">
                Clear
              </button>
              <button type="button" onClick={applyFilters} className="property-filters-primary-button">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;