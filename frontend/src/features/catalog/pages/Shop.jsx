import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CartButton from "../../cart/components/CartButton";
import { useCart } from "../../cart/hooks/useCart";
import "./shop.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const ALL_CATEGORIES = "all";

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function getPrimaryImage(images) {
  if (!Array.isArray(images)) return "";
  return images.find((image) => image.is_primary)?.image_url ?? images[0]?.image_url ?? "";
}

function isAvailable(product) {
  return product.status === "ACTIVE" && Number(product.stock_quantity) > 0;
}

function Icon({ size = 18, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="10.8" cy="10.8" r="6.8" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);

const ArrowIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);

const HeartIcon = ({ filled, ...props }) => (
  <Icon {...props} fill={filled ? "currentColor" : "none"}>
    <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  </Icon>
);

const CloseIcon = (props) => (
  <Icon {...props}>
    <path d="m18 6-12 12M6 6l12 12" />
  </Icon>
);

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function ProductCard({ product, isSaved, onToggleSave, onAdd }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={`zs-product-card zs-tone-${product.tone}`}>
      <div className="zs-product-visual">
        {product.image && !imageFailed && (
          <Link
            className="zs-product-image-link"
            to={`/products/${product.product_id}`}
            aria-label={`View ${product.name} details`}
          >
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </Link>
        )}
        {(!product.image || imageFailed) && (
          <Link
            className="zs-product-image-link"
            to={`/products/${product.product_id}`}
            aria-label={`View ${product.name} details`}
          >
            <span className="zs-image-fallback">ZENTO · {product.brand}</span>
          </Link>
        )}
        <button
          className={`zs-save-button${isSaved ? " is-saved" : ""}`}
          type="button"
          aria-label={`${isSaved ? "Remove" : "Save"} ${product.name} ${isSaved ? "from" : "to"} wishlist`}
          aria-pressed={isSaved}
          onClick={() => onToggleSave(product.product_id)}
        >
          <HeartIcon size={17} filled={isSaved} />
        </button>
        {!isAvailable(product) && (
          <span className="zs-stock-overlay">Currently unavailable</span>
        )}
        {isAvailable(product) && (
          <button
            className="zs-quick-add"
            type="button"
            onClick={() => onAdd(product)}
          >
            Add to bag <ArrowIcon size={15} />
          </button>
        )}
      </div>
      <div className="zs-product-info">
        <div className="zs-product-brand">{product.brand}</div>
        <div className="zs-product-heading">
          <div>
            <h3><Link to={`/products/${product.product_id}`}>{product.name}</Link></h3>
            <p>{product.description}</p>
          </div>
          <strong>{formatPrice(product.price)}</strong>
        </div>
        <div className="zs-product-foot">
          <span className={product.stock_quantity > 0 ? "zs-available" : "zs-unavailable"}>
            <i aria-hidden="true" />
            {product.stock_quantity > 0 ? "In stock" : "Out of stock"}
          </span>
          <span>{product.category}</span>
        </div>
      </div>
    </article>
  );
}

function FilterOptions({
  category,
  setCategory,
  categories,
  selectedBrands,
  toggleBrand,
  brands,
  inStockOnly,
  setInStockOnly,
  maxPrice,
  setMaxPrice,
  priceCeiling,
  priceStep,
}) {
  return (
    <>
      <fieldset className="zs-filter-group">
        <legend>Collection</legend>
        <label className="zs-filter-option" key={ALL_CATEGORIES}>
          <input
            type="radio"
            name="shop-category"
            value={ALL_CATEGORIES}
            checked={category === ALL_CATEGORIES}
            onChange={() => setCategory(ALL_CATEGORIES)}
          />
          <span>All pieces</span>
        </label>
        {categories.map((item) => (
          <label className="zs-filter-option" key={item.category_id}>
            <input
              type="radio"
              name="shop-category"
              value={item.category_id}
              checked={category === item.category_id}
              onChange={() => setCategory(item.category_id)}
            />
            <span>{item.category_name}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="zs-filter-group">
        <legend>Maker</legend>
        {brands.map((brand) => (
          <label className="zs-filter-option" key={brand.brand_id}>
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand.brand_id)}
              onChange={() => toggleBrand(brand.brand_id)}
            />
            <span>{brand.brand_name}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="zs-filter-group zs-price-group">
        <legend>Price, up to {formatPrice(maxPrice)}</legend>
        <input
          className="zs-price-range"
          type="range"
          min="0"
          max={priceCeiling}
          step={priceStep}
          value={maxPrice}
          aria-label="Maximum price"
          onChange={(event) => setMaxPrice(Number(event.target.value))}
        />
        <div className="zs-range-labels">
          <span>{formatPrice(0)}</span>
          <span>{formatPrice(priceCeiling)}</span>
        </div>
      </fieldset>

      <label className="zs-stock-toggle">
        <span>
          <strong>In stock only</strong>
          <small>Hide unavailable pieces</small>
        </span>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(event) => setInStockOnly(event.target.checked)}
        />
        <i aria-hidden="true" />
      </label>
    </>
  );
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const { addItem, openCart } = useCart();
  const categoryParam = searchParams.get("category");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(null);
  const [sortBy, setSortBy] = useState("featured");
  const [savedProducts, setSavedProducts] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const priceCeiling = Math.max(
    100,
    Math.ceil(Math.max(0, ...products.map((product) => product.price)) / 100) * 100,
  );
  const priceStep = Math.max(1, Math.ceil(priceCeiling / 40));
  const activeFilterCount =
    (category !== ALL_CATEGORIES ? 1 : 0) +
    selectedBrands.length +
    (inStockOnly ? 1 : 0) +
    (maxPrice !== null && maxPrice < priceCeiling ? 1 : 0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        const [productData, categoryData, brandData] = await Promise.all([
          fetchJson(`${API_BASE_URL}/api/products?limit=200`, controller.signal),
          fetchJson(`${API_BASE_URL}/api/categories`, controller.signal),
          fetchJson(`${API_BASE_URL}/api/brands`, controller.signal),
        ]);

        if (
          !Array.isArray(productData.result) ||
          !Array.isArray(categoryData.list) ||
          !Array.isArray(brandData.brands)
        ) {
          throw new Error("The catalog response from the server was not in the expected format.");
        }

        const categoryById = new Map(
          categoryData.list.map((item) => [item.category_id, item.category_name]),
        );
        if (categoryParam) {
          const matchingCategory = categoryData.list.find(
            (item) =>
              String(item.category_id) === categoryParam ||
              item.category_name.toLowerCase() === categoryParam.toLowerCase(),
          );
          setCategory(matchingCategory?.category_id ?? ALL_CATEGORIES);
        }
        const brandById = new Map(
          brandData.brands.map((item) => [item.brand_id, item.brand_name]),
        );

        const imageEntries = await Promise.all(
          productData.result.map(async (product) => {
            try {
              const imageData = await fetchJson(
                `${API_BASE_URL}/api/products/${product.product_id}/images`,
                controller.signal,
              );
              return [product.product_id, getPrimaryImage(imageData.result)];
            } catch (error) {
              if (error.name === "AbortError") throw error;
              console.warn(`Could not load images for product ${product.product_id}:`, error);
              return [product.product_id, ""];
            }
          }),
        );
        const imageByProductId = new Map(imageEntries);

        setProducts(
          productData.result.map((product) => ({
            ...product,
            price: Number(product.price),
            stock_quantity: Number(product.stock_quantity),
            category: categoryById.get(product.category_id) ?? "Other",
            brand: brandById.get(product.brand_id) ?? "Other",
            image: imageByProductId.get(product.product_id) ?? "",
            tone: ["stone", "rose", "blue", "sand", "sage"][
              Number(product.product_id) % 5
            ],
            badge: "",
          })),
        );
        setCategories(categoryData.list);
        setBrands(brandData.brands);
        setLoadError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError(error.message || "Could not load the shop catalog.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCatalog();
    return () => controller.abort();
  }, [categoryParam, reloadKey]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch =
        !query ||
        `${product.name} ${product.brand} ${product.category} ${product.sku}`
          .toLowerCase()
          .includes(query);
      const matchesCategory =
        category === ALL_CATEGORIES || product.category_id === category;
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand_id);
      const matchesAvailability = !inStockOnly || isAvailable(product);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesAvailability &&
        (maxPrice === null || product.price <= maxPrice)
      );
    });

    if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
    if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [category, inStockOnly, maxPrice, products, search, selectedBrands, sortBy]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!filterOpen && !mobileNavOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setFilterOpen(false);
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [filterOpen, mobileNavOpen]);

  const toggleBrand = (brand) => {
    setSelectedBrands((current) =>
      current.includes(brand)
        ? current.filter((item) => item !== brand)
        : [...current, brand],
    );
  };

  const clearFilters = () => {
    setCategory(ALL_CATEGORIES);
    setSelectedBrands([]);
    setInStockOnly(false);
    setMaxPrice(null);
    setSearch("");
  };

  const toggleSaved = (productId) => {
    // TODO(wire): Persist saved products through the wishlist feature when integration is requested.
    setSavedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
    setNotice(
      savedProducts.includes(productId)
        ? "Removed from your locally saved pieces"
        : "Saved locally for another look",
    );
  };

  const addToBag = async (product) => {
    const result = await addItem(product);
    setNotice(result.ok ? `${product.name} added to your bag` : result.message);
    if (result.ok) openCart();
  };

  const mobileFilterOptions = (
    <FilterOptions
      category={category}
      setCategory={setCategory}
      categories={categories}
      selectedBrands={selectedBrands}
      toggleBrand={toggleBrand}
      brands={brands}
      inStockOnly={inStockOnly}
      setInStockOnly={setInStockOnly}
      maxPrice={maxPrice ?? priceCeiling}
      setMaxPrice={setMaxPrice}
      priceCeiling={priceCeiling}
      priceStep={priceStep}
    />
  );

  return (
    <div className="z-shop">
      <div className="zs-announcement">
        <span>Thoughtful technology, chosen well</span>
        <span className="zs-announcement-divider" aria-hidden="true" />
        <span>A considered edit, updated gently</span>
      </div>

      <header className="zs-header">
        <button
          className="zs-menu-button"
          type="button"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <CloseIcon /> : <Icon><path d="M4 7h16M4 12h16M4 17h16" /></Icon>}
        </button>
        <Link className="zs-wordmark" to="/shop" aria-label="ZENTO shop home">
          ZENTO<span>.</span>
        </Link>
        <nav
          className={`zs-primary-nav${mobileNavOpen ? " is-open" : ""}`}
          aria-label="Main navigation"
        >
          <Link to="/home">Home</Link>
          <Link className="is-current" to="/shop" aria-current="page">Shop</Link>
          <a href="#the-edit">The edit</a>
        </nav>
        <div className="zs-header-actions">
          <Link className="zs-account-link" to="/login">Sign in</Link>
          <CartButton className="zs-bag-button" />
        </div>
      </header>

      <main>
        <section className="zs-hero" id="the-edit">
          <div className="zs-hero-copy">
            <p className="zs-eyebrow"><span /> The ZENTO collection / 01</p>
            <h1>Good things.<br /><em>Well chosen.</em></h1>
            <p className="zs-hero-description">
              Everyday technology with a little more thought behind it.
              Explore the pieces worth keeping close.
            </p>
            <a className="zs-hero-link" href="#catalog">
              Explore the collection <ArrowIcon size={16} />
            </a>
          </div>
          <div className="zs-hero-art" aria-label="A quiet study in modern objects">
            <div className="zs-art-orbit zs-art-orbit-one" />
            <div className="zs-art-orbit zs-art-orbit-two" />
            <div className="zs-art-disc" />
            <div className="zs-art-device">
              <span className="zs-device-camera" />
              <span className="zs-device-flash" />
              <span className="zs-device-lens" />
            </div>
            <div className="zs-art-caption">
              <span>01 — The everyday, refined</span>
              <span>Selected with intention</span>
            </div>
          </div>
          <div className="zs-hero-index" aria-hidden="true">
            <span>VOL. 01</span><i />            <span>EDIT 01</span>
          </div>
        </section>

        <section className="zs-catalog" id="catalog">
          <div className="zs-catalog-heading">
            <div>
              <p className="zs-eyebrow zs-eyebrow-light">Considered essentials</p>
              <h2>Find your next <em>favourite.</em></h2>
            </div>
            <p className="zs-catalog-note">
              A small collection, made to fit<br />the way you live.
            </p>
          </div>

          <div className="zs-category-pills" aria-label="Quick category filters">
            {[{ category_id: ALL_CATEGORIES, category_name: "All pieces" }, ...categories].map((item) => (
              <button
                type="button"
                key={item.category_id}
                className={category === item.category_id ? "is-selected" : ""}
                aria-pressed={category === item.category_id}
                onClick={() => setCategory(item.category_id)}
              >
                {item.category_name}
              </button>
            ))}
          </div>

          <div className="zs-shop-toolbar">
            <label className="zs-search">
              <SearchIcon size={18} />
              <input
                type="search"
                placeholder="Search the collection"
                value={search}
                aria-label="Search products"
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button type="button" aria-label="Clear search" onClick={() => setSearch("")}>
                  <CloseIcon size={16} />
                </button>
              )}
            </label>
            <button
              className="zs-mobile-filter-button"
              type="button"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen(true)}
            >
              <Icon><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /></Icon>
              Filters {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </button>
            <div className="zs-sort-wrap">
              <label htmlFor="zs-sort">Sort by</label>
              <select id="zs-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured">Curated</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          <div className="zs-catalog-layout">
            <aside className="zs-filter-sidebar" aria-label="Product filters">
              <div className="zs-filter-heading">
                <span>Refine your edit</span>
                {activeFilterCount > 0 && (
                  <button type="button" onClick={clearFilters}>Clear</button>
                )}
              </div>
              {mobileFilterOptions}
            </aside>

            {filterOpen && (
              <div className="zs-drawer-layer">
                <button
                  className="zs-drawer-scrim"
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setFilterOpen(false)}
                />
                <section
                  className="zs-filter-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="zs-drawer-title"
                >
                  <div className="zs-drawer-header">
                    <div>
                      <p className="zs-eyebrow">The details</p>
                      <h2 id="zs-drawer-title">Refine your edit</h2>
                    </div>
                    <button
                      type="button"
                      className="zs-drawer-close"
                      aria-label="Close filters"
                      onClick={() => setFilterOpen(false)}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  {mobileFilterOptions}
                  <div className="zs-drawer-actions">
                    <button type="button" className="zs-clear-button" onClick={clearFilters}>
                      Clear all
                    </button>
                    <button type="button" className="zs-apply-button" onClick={() => setFilterOpen(false)}>
                      Show {visibleProducts.length} pieces <ArrowIcon size={16} />
                    </button>
                  </div>
                </section>
              </div>
            )}

            <div className="zs-results">
              <div className="zs-results-bar">
                <p><strong>{visibleProducts.length}</strong> pieces, chosen with care</p>
                {activeFilterCount > 0 && (
                  <button type="button" onClick={clearFilters}>Clear all filters</button>
                )}
              </div>
              <div className="zs-active-filters" aria-live="polite">
                {category !== ALL_CATEGORIES && (
                  <button
                    type="button"
                    onClick={() => setCategory(ALL_CATEGORIES)}
                  >
                    {categories.find((item) => item.category_id === category)?.category_name}
                    <CloseIcon size={13} />
                  </button>
                )}
                {selectedBrands.map((brandId) => (
                  <button type="button" key={brandId} onClick={() => toggleBrand(brandId)}>
                    {brands.find((item) => item.brand_id === brandId)?.brand_name}
                    <CloseIcon size={13} />
                  </button>
                ))}
                {inStockOnly && (
                  <button type="button" onClick={() => setInStockOnly(false)}>In stock<CloseIcon size={13} /></button>
                )}
                {maxPrice !== null && maxPrice < priceCeiling && (
                  <button type="button" onClick={() => setMaxPrice(null)}>
                    Under {formatPrice(maxPrice)}<CloseIcon size={13} />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="zs-catalog-message" role="status">
                  <span className="zs-loading-mark" aria-hidden="true" />
                  <p>Finding the pieces in your collection…</p>
                </div>
              ) : loadError ? (
                <div className="zs-catalog-message zs-catalog-error" role="alert">
                  <p>We couldn’t load the collection.</p>
                  <span>{loadError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setReloadKey((key) => key + 1);
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : visibleProducts.length > 0 ? (
                <div className="zs-product-grid">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                      isSaved={savedProducts.includes(product.product_id)}
                      onToggleSave={toggleSaved}
                      onAdd={addToBag}
                    />
                  ))}
                </div>
              ) : (
                <div className="zs-empty-state">
                  <span className="zs-empty-mark">Z.</span>
                  <p className="zs-eyebrow">{products.length ? "A quiet shelf" : "The collection"}</p>
                  <h3>{products.length ? "Nothing in this edit just yet." : "No products to show yet."}</h3>
                  <p>
                    {products.length
                      ? "Try a different search or ease a filter to find your piece."
                      : "Products added to the catalog will appear here."}
                  </p>
                  <button type="button" onClick={clearFilters}>Clear your filters</button>
                </div>
              )}
              <p className="zs-mock-note">
                Prices are shown as stored; the product API does not specify a currency.
              </p>
            </div>
          </div>
        </section>

        <section className="zs-footnote">
          <span>Less, but better.</span>
          <span>Objects for the everyday / ZENTO</span>
          <a href="#catalog" aria-label="Back to the collection"><ArrowIcon size={17} /></a>
        </section>
      </main>

      <div className={`zs-toast${notice ? " is-visible" : ""}`} role="status" aria-live="polite">
        {notice}
      </div>
    </div>
  );
}
