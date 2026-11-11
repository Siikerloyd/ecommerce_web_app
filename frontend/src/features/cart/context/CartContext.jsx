import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../../auth/context/AuthContext";
import { CartContext } from "./cartContextStore.js";

const STORAGE_KEY = "zento-cart";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function readStoredCart() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const items = JSON.parse(saved);
    if (!Array.isArray(items)) {
      console.warn("Saved cart data is not a list. Starting with an empty cart.");
      return [];
    }

    return items.filter(
      (item) =>
        item &&
        item.product_id !== undefined &&
        item.name &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) >= 1,
    );
  } catch (error) {
    console.error("Could not read the saved cart:", error);
    return [];
  }
}

function getImage(product) {
  return product.image || product.image_url || product.images?.[0]?.src || "";
}

function mapRemoteItem(item) {
  return {
    cart_item_id: Number(item.cart_item_id),
    product_id: Number(item.product_id),
    sku: item.sku ?? "",
    name: item.name,
    brand: item.brand_name ?? "",
    category: item.category_name ?? "",
    image: item.image_url ?? "",
    price: Number(item.price),
    stock_quantity: Number(item.stock_quantity),
    quantity: Number(item.quantity),
  };
}

async function cartRequest(path = "", options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/cart${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Cart request failed (${response.status})`);
  }

  return data.result;
}

async function fetchRemoteItems() {
  const result = await cartRequest();
  return (result?.items ?? []).map(mapRemoteItem);
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "The cart could not be updated.";
}

function saveGuestCart(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Could not save the cart to local storage:", error);
  }
}

export function CartProvider({ children }) {
  const { user, isLoading: isAuthLoading } = useContext(AuthContext);
  const userId = user?.user_id ?? null;
  const [items, setItems] = useState(readStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  const [settledAttempt, setSettledAttempt] = useState(-1);
  const [syncedUserId, setSyncedUserId] = useState(null);
  const [cartError, setCartError] = useState("");
  const [syncAttempt, setSyncAttempt] = useState(0);
  const activeUserId = useRef(null);
  const skipGuestPersistence = useRef(false);
  const syncSequence = useRef(0);
  const isCartLoading = isAuthLoading || (
    Boolean(userId) &&
    (syncedUserId !== userId || isCartSyncing || syncAttempt !== settledAttempt)
  );

  useEffect(() => {
    if (isAuthLoading) return;
    const sequence = ++syncSequence.current;

    if (!userId) {
      const leavingAccount = activeUserId.current !== null;
      if (leavingAccount) {
        activeUserId.current = null;
        skipGuestPersistence.current = true;
        try {
          window.localStorage.setItem(STORAGE_KEY, "[]");
        } catch (error) {
          console.error("Could not clear the saved cart:", error);
        }
      }
      const settleGuestCart = async () => {
        await Promise.resolve();
        if (sequence !== syncSequence.current) return;
        if (leavingAccount) setItems([]);
        setCartError("");
        setIsCartSyncing(false);
        setSyncedUserId(null);
        setSettledAttempt(syncAttempt);
      };
      settleGuestCart();
      return;
    }

    const previousUserId = activeUserId.current;
    activeUserId.current = userId;
    const guestItems = readStoredCart();

    const syncCart = async () => {
      await Promise.resolve();
      if (sequence !== syncSequence.current) return;
      if (previousUserId !== null && previousUserId !== userId) setItems([]);
      setCartError("");
      setSyncedUserId(userId);
      setIsCartSyncing(true);
      try {
        const remoteItems = await fetchRemoteItems();
        const remoteByProductId = new Map(
          remoteItems.map((item) => [item.product_id, item]),
        );

        for (const guestItem of guestItems) {
          const productId = Number(guestItem.product_id);
          const existing = remoteByProductId.get(productId);
          const desiredQuantity = Math.max(
            Number(existing?.quantity ?? 0),
            Number(guestItem.quantity),
          );

          if (existing && desiredQuantity > existing.quantity) {
            await cartRequest(`/items/${existing.cart_item_id}`, {
              method: "PATCH",
              body: JSON.stringify({ quantity: desiredQuantity }),
            });
          } else if (!existing) {
            await cartRequest("/items", {
              method: "POST",
              body: JSON.stringify({
                product_id: productId,
                quantity: desiredQuantity,
              }),
            });
          }
        }

        const latestItems = await fetchRemoteItems();
        if (sequence !== syncSequence.current) return;
        setItems(latestItems);
        window.localStorage.removeItem(STORAGE_KEY);
        setCartError("");
      } catch (error) {
        if (sequence !== syncSequence.current) return;
        console.error("Could not synchronize the cart with the account:", error);
        setCartError(getErrorMessage(error));
      } finally {
        if (sequence === syncSequence.current) {
          setIsCartSyncing(false);
          setSettledAttempt(syncAttempt);
        }
      }
    };

    syncCart();
  }, [isAuthLoading, userId, syncAttempt]);

  useEffect(() => {
    if (isAuthLoading || userId) return;
    if (skipGuestPersistence.current) {
      skipGuestPersistence.current = false;
      return;
    }

    try {
      saveGuestCart(items);
    } catch (error) {
      console.error("Could not save the cart to local storage:", error);
    }
  }, [items, isAuthLoading, userId]);

  const refreshRemoteCart = useCallback(async () => {
    const latestItems = await fetchRemoteItems();
    setItems(latestItems);
  }, []);

  const addItem = useCallback(async (product, requestedQuantity = 1) => {
    const stock = Number(product.stock_quantity);
    const price = Number(product.price);
    const quantity = Math.floor(Number(requestedQuantity));

    if (
      product.product_id === undefined ||
      !product.name ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !Number.isFinite(stock) ||
      stock < 1
    ) {
      return { ok: false, message: "This product is not available to add." };
    }

    const productId = Number(product.product_id);
    const existing = items.find((item) => Number(item.product_id) === productId);
    if (existing && existing.quantity >= stock) {
      return { ok: false, message: "You already have the available quantity in your cart." };
    }

    const addedQuantity = Math.min(quantity, stock - (existing?.quantity ?? 0));
    const cartProduct = {
      product_id: productId,
      sku: product.sku ?? "",
      name: product.name,
      brand: product.brand ?? "",
      category: product.category ?? "",
      image: getImage(product),
      price,
      stock_quantity: stock,
      quantity: (existing?.quantity ?? 0) + addedQuantity,
    };

    if (userId) {
      if (isCartLoading) {
        return { ok: false, message: "Your account cart is still loading. Please try again." };
      }
      if (cartError) {
        return { ok: false, message: "Retry cart sync before adding account items." };
      }

      try {
        setCartError("");
        await cartRequest("/items", {
          method: "POST",
          body: JSON.stringify({ product_id: productId, quantity: addedQuantity }),
        });
        await refreshRemoteCart();
        return { ok: true, quantity: addedQuantity };
      } catch (error) {
        const message = getErrorMessage(error);
        setCartError(message);
        return { ok: false, message };
      }
    }

    setItems((current) =>
      current.some((item) => Number(item.product_id) === productId)
        ? current.map((item) => (Number(item.product_id) === productId ? cartProduct : item))
        : [...current, cartProduct],
    );

    return { ok: true, quantity: addedQuantity };
  }, [items, userId, isCartLoading, cartError, refreshRemoteCart]);

  const updateQuantity = useCallback(async (productId, requestedQuantity) => {
    const quantity = Math.floor(Number(requestedQuantity));
    const item = items.find((cartItem) => Number(cartItem.product_id) === Number(productId));
    if (!item || !Number.isFinite(quantity)) return { ok: false };

    const maximum = Math.max(1, Number(item.stock_quantity) || 1);
    const nextQuantity = Math.max(1, Math.min(maximum, quantity));

    if (userId) {
      if (isCartLoading) {
        return { ok: false, message: "Your account cart is still loading. Please try again." };
      }
      if (!item.cart_item_id) {
        const nextItems = items.map((cartItem) =>
          Number(cartItem.product_id) === Number(productId)
            ? { ...cartItem, quantity: nextQuantity }
            : cartItem,
        );
        setItems(nextItems);
        saveGuestCart(nextItems);
        return { ok: true };
      }
      if (cartError) {
        return { ok: false, message: "Retry cart sync before changing saved account items." };
      }
      try {
        setCartError("");
        await cartRequest(`/items/${item.cart_item_id}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity: nextQuantity }),
        });
        await refreshRemoteCart();
        return { ok: true };
      } catch (error) {
        const message = getErrorMessage(error);
        setCartError(message);
        return { ok: false, message };
      }
    }

    setItems((current) =>
      current.map((cartItem) =>
        Number(cartItem.product_id) === Number(productId)
          ? { ...cartItem, quantity: nextQuantity }
          : cartItem,
      ),
    );
    return { ok: true };
  }, [items, userId, isCartLoading, cartError, refreshRemoteCart]);

  const removeItem = useCallback(async (productId) => {
    const item = items.find((cartItem) => Number(cartItem.product_id) === Number(productId));
    if (!item) return { ok: false };

    if (userId) {
      if (isCartLoading) {
        return { ok: false, message: "Your account cart is still loading. Please try again." };
      }
      if (!item.cart_item_id) {
        const nextItems = items.filter(
          (cartItem) => Number(cartItem.product_id) !== Number(productId),
        );
        setItems(nextItems);
        saveGuestCart(nextItems);
        return { ok: true };
      }
      if (cartError) {
        return { ok: false, message: "Retry cart sync before changing saved account items." };
      }
      try {
        setCartError("");
        await cartRequest(`/items/${item.cart_item_id}`, { method: "DELETE" });
        await refreshRemoteCart();
        return { ok: true };
      } catch (error) {
        const message = getErrorMessage(error);
        setCartError(message);
        return { ok: false, message };
      }
    }

    setItems((current) =>
      current.filter((cartItem) => Number(cartItem.product_id) !== Number(productId)),
    );
    return { ok: true };
  }, [items, userId, isCartLoading, cartError, refreshRemoteCart]);

  const clearCart = useCallback(async () => {
    if (userId) {
      if (isCartLoading) {
        return { ok: false, message: "Your account cart is still loading. Please try again." };
      }
      try {
        setCartError("");
        await cartRequest("/items", { method: "DELETE" });
        setItems([]);
        window.localStorage.removeItem(STORAGE_KEY);
        return { ok: true };
      } catch (error) {
        const message = getErrorMessage(error);
        setCartError(message);
        return { ok: false, message };
      }
    }

    setItems([]);
    return { ok: true };
  }, [userId, isCartLoading]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const retryCartSync = useCallback(() => setSyncAttempt((attempt) => attempt + 1), []);
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isCartOpen,
      isCartLoading,
      isAuthenticated: Boolean(userId),
      cartError,
      retryCartSync,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      isCartOpen,
      isCartLoading,
      userId,
      cartError,
      retryCartSync,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
