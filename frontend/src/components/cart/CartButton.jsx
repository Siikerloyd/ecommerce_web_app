import { useCart } from "../../hooks/useCart";

function BagIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export default function CartButton({ className }) {
  const { itemCount, openCart } = useCart();

  return (
    <button
      className={`${className} zcart-trigger`}
      type="button"
      aria-label={`Open shopping cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      aria-haspopup="dialog"
      onClick={openCart}
    >
      <BagIcon />
      <span>Bag</span>
      <b>{itemCount}</b>
    </button>
  );
}
