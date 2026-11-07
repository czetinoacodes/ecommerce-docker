"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { Producto } from "@/lib/types";

interface CartItem {
  product: Producto;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  hydrated: boolean;
  listeners: Set<() => void>;
}

interface StoreContextValue {
  items: CartItem[];
  itemCount: number;
  ready: boolean;
  addToCart: (product: Producto) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const LEGACY_STORAGE_KEY = "tech-store-cart";
const EMPTY_CART: CartItem[] = [];
const cartStores = new Map<string, CartStore>();
const StoreContext = createContext<StoreContextValue | null>(null);

function getCartStore(userId: string | null): CartStore {
  const storeKey = userId ?? "guest";
  let store = cartStores.get(storeKey);

  if (!store) {
    store = { items: EMPTY_CART, hydrated: false, listeners: new Set() };
    cartStores.set(storeKey, store);
  }

  return store;
}

function getStorageKey(userId: string) {
  return `tech-store-cart:${encodeURIComponent(userId)}`;
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null || !("product" in value)) {
    return false;
  }

  const item = value as { product: unknown; quantity: unknown };
  if (
    typeof item.product !== "object" ||
    item.product === null ||
    typeof item.quantity !== "number" ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1
  ) {
    return false;
  }

  const product = item.product as Record<string, unknown>;
  return (
    typeof product.id === "number" &&
    typeof product.name === "string" &&
    Number.isFinite(Number(product.price))
  );
}

function initializeCart(store: CartStore, userId: string | null) {
  if (store.hydrated || typeof window === "undefined") {
    return;
  }

  store.hydrated = true;
  localStorage.removeItem(LEGACY_STORAGE_KEY);

  if (!userId) {
    store.items = EMPTY_CART;
    return;
  }

  const savedCart = localStorage.getItem(getStorageKey(userId));
  if (!savedCart) {
    return;
  }

  try {
    const parsedCart: unknown = JSON.parse(savedCart);
    if (
      !Array.isArray(parsedCart) ||
      !parsedCart.every((item: unknown) => isCartItem(item))
    ) {
      throw new Error("El contenido guardado no es una lista de productos.");
    }

    store.items = parsedCart.map((item: CartItem) => ({
      ...item,
      product: { ...item.product, price: Number(item.product.price) },
    }));
  } catch (error) {
    console.error("No se pudo leer el carrito guardado.", error);
    localStorage.removeItem(getStorageKey(userId));
  }
}

function subscribe(
  store: CartStore,
  userId: string | null,
  listener: () => void
) {
  store.listeners.add(listener);
  const wasHydrated = store.hydrated;
  initializeCart(store, userId);
  if (!wasHydrated && store.hydrated) {
    listener();
  }

  return () => store.listeners.delete(listener);
}

function updateCart(
  store: CartStore,
  userId: string | null,
  nextItems: CartItem[]
) {
  if (!userId) {
    return;
  }

  store.items = nextItems;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(store.items));
  store.listeners.forEach((listener) => listener());
}

export function StoreProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const store = getCartStore(userId);
  const items = useSyncExternalStore(
    (listener) => subscribe(store, userId, listener),
    () => (store.hydrated ? store.items : EMPTY_CART),
    () => EMPTY_CART
  );
  const ready = useSyncExternalStore(
    (listener) => subscribe(store, userId, listener),
    () => store.hydrated,
    () => false
  );

  const addToCart = useCallback(
    (product: Producto) => {
      if (!userId) {
        return;
      }

      const existingItem = store.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        updateCart(
          store,
          userId,
          store.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
        return;
      }

      updateCart(store, userId, [...store.items, { product, quantity: 1 }]);
    },
    [store, userId]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      updateCart(
        store,
        userId,
        store.items.filter((item) => item.product.id !== productId)
      );
    },
    [store, userId]
  );

  const clearCart = useCallback(() => {
    updateCart(store, userId, []);
  }, [store, userId]);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      ready,
      addToCart,
      removeFromCart,
      clearCart,
    }),
    [items, ready, addToCart, removeFromCart, clearCart]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore debe usarse dentro de StoreProvider.");
  }
  return context;
}
