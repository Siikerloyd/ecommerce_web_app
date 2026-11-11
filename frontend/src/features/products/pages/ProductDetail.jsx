import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CartButton from "../../cart/components/CartButton";
import { useCart } from "../../cart/hooks/useCart";
import "./product-detail.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

function mapImages(images, productName) {
  if (!Array.isArray(images)) return [];

  return images
    .filter((image) => image.image_url)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((image, index) => ({
      src: image.image_url,
      alt: `${productName}, image ${index + 1}`,
    }));
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

const ChevronIcon = ({ direction = "right", ...props }) => (
  <Icon {...props}>
    <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
  </Icon>
);

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function ProductTile({ product }) {
  return (
    <Link className="zpd-related-card" to={`/products/${product.product_id}`}>
      <div className="zpd-related-image">
        {product.images[0] ? (
          <img src={product.images[0].src} alt="" loading="lazy" />
        ) : (
          <span className="zpd-related-placeholder">ZENTO · {product.brand}</span>
        )}
        <span>Explore piece <ArrowIcon size={14} /></span>
      </div>
      <div className="zpd-related-meta">
        <span>{product.brand}</span>
        <span>{formatPrice(product.price)}</span>
      </div>
      <h3>{product.name}</h3>
    </Link>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  return <ProductDetailContent key={id} id={id} />;
}

function ProductDetailContent({ id }) {
  const [loadState, setLoadState] = useState({ status: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const { addItem, openCart, isAuthenticated } = useCart();

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        const productData = await fetchJson(`${API_BASE_URL}/api/products/${id}`, controller.signal);
        const product = productData.result;
        if (!product || product.product_id === undefined) {
          throw new Error("The product response was not in the expected format.");
        }

        const [imagesData, categoryData, brandData] = await Promise.all([
          fetchJson(`${API_BASE_URL}/api/products/${id}/images`, controller.signal),
          product.category_id
            ? fetchJson(`${API_BASE_URL}/api/category/${product.category_id}`, controller.signal)
            : Promise.resolve(null),
          product.brand_id
            ? fetchJson(`${API_BASE_URL}/api/brands/${product.brand_id}`, controller.signal)
            : Promise.resolve(null),
        ]);

        let relatedProducts = [];
        let relatedError = "";
        if (product.category_id) {
          try {
            const [relatedData, brandsData] = await Promise.all([
              fetchJson(
                `${API_BASE_URL}/api/products?category_id=${product.category_id}&limit=6`,
                controller.signal,
              ),
              fetchJson(`${API_BASE_URL}/api/brands`, controller.signal),
            ]);

            if (!Array.isArray(relatedData.result) || !Array.isArray(brandsData.brands)) {
              throw new Error("The related product response was not in the expected format.");
            }

            const brandsById = new Map(
              brandsData.brands.map((brand) => [brand.brand_id, brand.brand_name]),
            );
            relatedProducts = await Promise.all(
              relatedData.result
                .filter((item) => item.product_id !== product.product_id)
                .map(async (item) => {
                  let images = [];
                  try {
                    const imageData = await fetchJson(
                      `${API_BASE_URL}/api/products/${item.product_id}/images`,
                      controller.signal,
                    );
                    images = mapImages(imageData.result, item.name);
                  } catch (error) {
                    if (error.name === "AbortError") throw error;
                    console.warn(`Could not load images for related product ${item.product_id}:`, error);
                  }
                  return {
                    ...item,
                    price: Number(item.price),
                    brand: brandsById.get(item.brand_id) ?? "Other",
                    images,
                  };
                }),
            );
          } catch (error) {
            if (error.name === "AbortError") throw error;
            console.error("Could not load related products:", error);
            relatedError = "Related pieces could not be loaded right now.";
          }
        }

        if (!Array.isArray(imagesData.result)) {
          throw new Error("The product images response was not in the expected format.");
        }

        setLoadState({
          status: "success",
          product: {
            ...product,
            price: Number(product.price),
            stock_quantity: Number(product.stock_quantity),
            category: categoryData?.["category id"]?.category_name ?? "Other",
            brand: brandData?.result?.brand_name ?? "Other",
            images: mapImages(imagesData.result, product.name),
          },
          relatedProducts,
          relatedError,
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setLoadState({
          status: error.status === 404 ? "not-found" : "error",
          error: error.message || "Could not load this product.",
        });
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [id, retryKey]);

  const product = loadState.status === "success" ? loadState.product : null;
  const relatedProducts = loadState.status === "success" ? loadState.relatedProducts : [];
  const available = Boolean(product && product.status === "ACTIVE" && product.stock_quantity > 0);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!lightboxOpen || !product) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") {
        setActiveImage((current) => (current + 1) % product.images.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveImage((current) => (current - 1 + product.images.length) % product.images.length);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [lightboxOpen, product]);

  if (loadState.status === "loading") {
    return (
      <div className="zpd-page">
        <header className="zpd-header">
          <Link className="zpd-wordmark" to="/shop">ZENTO<span>.</span></Link>
          <Link className="zpd-back-link" to="/shop">Back to the collection <ArrowIcon size={15} /></Link>
        </header>
        <main className="zpd-not-found" role="status">
          <span className="zpd-not-found-mark">Z.</span>
          <p className="zpd-eyebrow">One moment</p>
          <h1>Finding your piece.</h1>
          <p>We’re bringing the product details together.</p>
        </main>
      </div>
    );
  }

  if (loadState.status === "not-found") {
    return (
      <div className="zpd-page">
        <header className="zpd-header">
          <Link className="zpd-wordmark" to="/shop">ZENTO<span>.</span></Link>
          <Link className="zpd-back-link" to="/shop">Back to the collection <ArrowIcon size={15} /></Link>
        </header>
        <main className="zpd-not-found">
          <span className="zpd-not-found-mark">Z.</span>
          <p className="zpd-eyebrow">A quiet shelf</p>
          <h1>This piece isn’t in our edit.</h1>
          <p>That product link may have changed. Return to the collection to find another.</p>
          <Link className="zpd-button zpd-button-dark" to="/shop">Explore the collection <ArrowIcon size={16} /></Link>
        </main>
      </div>
    );
  }

  if (loadState.status === "error") {
    return (
      <div className="zpd-page">
        <header className="zpd-header">
          <Link className="zpd-wordmark" to="/shop">ZENTO<span>.</span></Link>
          <Link className="zpd-back-link" to="/shop">Back to the collection <ArrowIcon size={15} /></Link>
        </header>
        <main className="zpd-not-found" role="alert">
          <span className="zpd-not-found-mark">Z.</span>
          <p className="zpd-eyebrow">A connection issue</p>
          <h1>We couldn’t load this piece.</h1>
          <p>{loadState.error}</p>
          <button
            className="zpd-button zpd-button-dark"
            type="button"
            onClick={() => {
              setLoadState({ status: "loading" });
              setRetryKey((current) => current + 1);
            }}
          >
            Try again <ArrowIcon size={16} />
          </button>
        </main>
      </div>
    );
  }

  const currentImage = product.images[activeImage];

  const moveGallery = (step) => {
    setActiveImage((current) => (current + step + product.images.length) % product.images.length);
    setImageFailed(false);
  };

  const addToBag = async () => {
    if (!available) return;
    const result = await addItem(product, quantity);
    setNotice(
      result.ok
        ? `${result.quantity} ${result.quantity === 1 ? "piece" : "pieces"} added to your bag`
        : result.message,
    );
    if (result.ok) openCart();
  };

  return (
    <div className="zpd-page">
      <div className="zpd-announcement">
        <span>Thoughtful technology, chosen well</span>
        <i aria-hidden="true" />
        <span>A considered edit, updated gently</span>
      </div>

      <header className="zpd-header">
        <Link className="zpd-wordmark" to="/shop" aria-label="ZENTO shop">ZENTO<span>.</span></Link>
        <nav className="zpd-nav" aria-label="Main navigation">
          <Link to="/shop">Shop</Link>
          <a href="#product-details">Details</a>
        </nav>
        <CartButton className="zpd-bag-button" />
      </header>

      <main>
        <div className="zpd-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category_id}`}>{product.category}</Link>
          <span>/</span>
          <span aria-current="page">{product.name}</span>
        </div>

        <section className="zpd-product-layout">
          <div className="zpd-gallery">
            <div className={`zpd-main-image${imageFailed || !currentImage ? " is-fallback" : ""}`}>
              {!imageFailed && currentImage ? (
                <button
                  type="button"
                  className="zpd-image-expand"
                  aria-label="Enlarge product image"
                  disabled={!currentImage}
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={currentImage.src}
                    alt={currentImage.alt}
                    onError={() => setImageFailed(true)}
                  />
                </button>
              ) : (
                <div className="zpd-image-placeholder">ZENTO <span>— {product.brand}</span></div>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="zpd-gallery-arrow zpd-gallery-arrow-left"
                    aria-label="Previous product image"
                    onClick={() => moveGallery(-1)}
                  >
                    <ChevronIcon direction="left" />
                  </button>
                  <button
                    type="button"
                    className="zpd-gallery-arrow zpd-gallery-arrow-right"
                    aria-label="Next product image"
                    onClick={() => moveGallery(1)}
                  >
                    <ChevronIcon />
                  </button>
                </>
              )}
              <span className="zpd-image-count">
                {product.images.length
                  ? `${String(activeImage + 1).padStart(2, "0")} / ${String(product.images.length).padStart(2, "0")}`
                  : "No images"}
              </span>
            </div>
            <div className="zpd-thumbnails" aria-label="Product images">
              {product.images.map((image, index) => (
                <button
                  type="button"
                  key={image.src}
                  className={index === activeImage ? "is-active" : ""}
                  aria-label={`Show image ${index + 1}: ${image.alt}`}
                  aria-pressed={index === activeImage}
                  onClick={() => {
                    setActiveImage(index);
                    setImageFailed(false);
                  }}
                >
                  <img src={image.src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <p className="zpd-gallery-caption">A closer look / {product.brand}</p>
          </div>

          <section className="zpd-buy-panel" aria-labelledby="product-title">
            <p className="zpd-eyebrow"><span /> {product.brand} / {product.category}</p>
            <h1 id="product-title">{product.name}</h1>
            <p className="zpd-sku">Object no. {product.sku}</p>
            <p className="zpd-description">
              {product.description || "No description has been added to the catalog yet."}
            </p>

            <div className="zpd-price-row">
              <strong>{formatPrice(product.price)}</strong>
            </div>
            <p className="zpd-currency-note">Currency is not specified in the product catalog</p>

            <div className={`zpd-stock ${available ? "is-available" : "is-unavailable"}`}>
              <i aria-hidden="true" />
              <strong>{available ? "Available now" : "Currently unavailable"}</strong>
              <span>{available ? `${product.stock_quantity} in stock` : "Please check back later"}</span>
            </div>

            <div className="zpd-purchase-row">
              <div className="zpd-quantity" aria-label="Quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  −
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={!available || quantity >= product.stock_quantity}
                  onClick={() => setQuantity((value) => Math.min(product.stock_quantity, value + 1))}
                >
                  +
                </button>
              </div>
              <button
                className="zpd-button zpd-button-dark zpd-add-button"
                type="button"
                disabled={!available}
                onClick={addToBag}
              >
                Add to bag <ArrowIcon size={17} />
              </button>
              <button
                className={`zpd-wishlist-button${isSaved ? " is-saved" : ""}`}
                type="button"
                aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isSaved}
                onClick={() => {
                  setIsSaved((saved) => !saved);
                  setNotice(isSaved ? "Removed from your local wishlist" : "Saved to your local wishlist");
                }}
              >
                <HeartIcon filled={isSaved} />
              </button>
            </div>
            {available && (
              <p className="zpd-quantity-note">
                Up to {product.stock_quantity} available. Quantity is limited to current stock.
              </p>
            )}

            <div className="zpd-purchase-note">
              <span>01</span>
              <p>
                Product information comes from the catalog.{" "}
                {isAuthenticated
                  ? "Your cart is saved to your account."
                  : "Your cart is saved on this device until you sign in."}
              </p>
            </div>

            <div className="zpd-meta-list">
              <div><span>Maker</span><strong>{product.brand}</strong></div>
              <div><span>Collection</span><strong>{product.category}</strong></div>
              <div><span>Reference</span><strong>{product.sku}</strong></div>
            </div>
          </section>
        </section>

        <section className="zpd-details" id="product-details">
          <div className="zpd-details-intro">
            <p className="zpd-eyebrow">The finer points</p>
            <h2>Made for the<br /><em>everyday.</em></h2>
            <p>{product.description || "No description has been added to the catalog yet."}</p>
          </div>
          <div className="zpd-spec-panel">
            <div className="zpd-spec-heading">
              <div>
                <p className="zpd-eyebrow">At a glance</p>
                <h3>Product notes</h3>
              </div>
              <span>CATALOG</span>
            </div>
            {[
              ["Brand", product.brand],
              ["Category", product.category],
              ["Availability", product.status],
              ["SKU", product.sku],
            ].map(([label, value], index) => (
              <div className="zpd-spec-row" key={label}>
                <span><i>{String(index + 1).padStart(2, "0")}</i>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
            <p className="zpd-spec-disclaimer">
              Details shown here are the fields currently available in the product catalog.
            </p>
          </div>
        </section>

        {(relatedProducts.length > 0 || loadState.relatedError) && (
          <section className="zpd-related">
            <div className="zpd-related-heading">
              <div>
                <p className="zpd-eyebrow">A similar point of view</p>
                <h2>More from <em>{product.category.toLowerCase()}.</em></h2>
              </div>
              <Link to="/shop">View the collection <ArrowIcon size={15} /></Link>
            </div>
            {relatedProducts.length > 0 && (
              <div className="zpd-related-grid">
                {relatedProducts.map((item) => <ProductTile key={item.product_id} product={item} />)}
              </div>
            )}
            {loadState.relatedError && (
              <p className="zpd-related-error" role="status">{loadState.relatedError}</p>
            )}
          </section>
        )}
      </main>

      <footer className="zpd-footer">
        <Link className="zpd-wordmark" to="/shop">ZENTO<span>.</span></Link>
        <span>Objects for the everyday / thoughtfully chosen</span>
        <Link to="/shop">Back to shop <ArrowIcon size={14} /></Link>
      </footer>

      {lightboxOpen && (
        <div
          className="zpd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${activeImage + 1} of ${product.name}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightboxOpen(false);
          }}
        >
          <button
            type="button"
            className="zpd-lightbox-close"
            aria-label="Close enlarged image"
            onClick={() => setLightboxOpen(false)}
          >
            <CloseIcon />
          </button>
          {product.images.length > 1 && (
            <button type="button" className="zpd-lightbox-arrow is-left" aria-label="Previous image" onClick={() => moveGallery(-1)}>
              <ChevronIcon direction="left" />
            </button>
          )}
          <img src={currentImage.src} alt={currentImage.alt} />
          {product.images.length > 1 && (
            <button type="button" className="zpd-lightbox-arrow is-right" aria-label="Next image" onClick={() => moveGallery(1)}>
              <ChevronIcon />
            </button>
          )}
          <p>{currentImage.alt} · {activeImage + 1} of {product.images.length}</p>
        </div>
      )}

      <div className={`zpd-toast${notice ? " is-visible" : ""}`} role="status" aria-live="polite">
        {notice}
      </div>
    </div>
  );
}
