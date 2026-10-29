import { useEffect, useRef, useState } from "react";
import "./PropertyFilters.css";

const PropertyFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [beds, setBeds] = useState("0");
  const [baths, setBaths] = useState("0");
  const [minPrice, setMinPrice] = useState(800);
  const [maxPrice, setMaxPrice] = useState(4500);
  const [draggingHandle, setDraggingHandle] = useState(null);
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
    setBeds("0");
    setBaths("0");
    setMinPrice(800);
    setMaxPrice(4500);
  };

  useEffect(() => {
    if (!draggingHandle) return;

    const handlePointerMove = (event) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const relativeX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
      const nextValue = Math.round((relativeX / rect.width) * 10000 / 50) * 50;

      if (draggingHandle === "min") {
        handleMinChange(Math.max(0, Math.min(nextValue, maxPrice)));
      }

      if (draggingHandle === "max") {
        handleMaxChange(Math.max(minPrice, Math.min(nextValue, 10000)));
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
    console.log({
      city,
      zipcode,
      beds,
      baths,
      minPrice,
      maxPrice,
    });
    setIsOpen(false);
  };

  return (
    <div className="property-filters-wrapper">
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
                    <option value="0">0+</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
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
                    <option value="0">0+</option>
                    <option value="0.5">0.5+</option>
                    <option value="1">1+</option>
                    <option value="1.5">1.5+</option>
                    <option value="2">2+</option>
                    <option value="2.5">2.5+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
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
                    left: `${(minPrice / 10000) * 100}%`,
                    width: `${((maxPrice - minPrice) / 10000) * 100}%`,
                    height: 6,
                    transform: "translateY(-50%)",
                    borderRadius: 999,
                    background: "#4287f7",
                  }}
                />

                <div
                  aria-label="Minimum price"
                  aria-valuemin={0}
                  aria-valuemax={10000}
                  aria-valuenow={minPrice}
                  role="slider"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setDraggingHandle("min");
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${(minPrice / 10000) * 100}%`,
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
                  aria-valuemax={10000}
                  aria-valuenow={maxPrice}
                  role="slider"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setDraggingHandle("max");
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${(maxPrice / 10000) * 100}%`,
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