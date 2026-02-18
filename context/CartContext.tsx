"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "followerbase-cart";

export interface CartItem {
  id: string;
  productSlug: string;
  productName: string;
  quantity: number;
  priceCents: number;
  target: string;
}

interface CartStorage {
  items: CartItem[];
  sellerNote: string;
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  sellerNote: string;
  setSellerNote: (note: string) => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartStorage {
  if (typeof window === "undefined") return { items: [], sellerNote: "" };
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [], sellerNote: "" };
    const data = JSON.parse(raw);
    const items = Array.isArray(data.items) ? data.items : [];
    const sellerNote = typeof data.sellerNote === "string" ? data.sellerNote : "";
    return { items, sellerNote };
  } catch {
    return { items: [], sellerNote: "" };
  }
}

function saveToStorage(items: CartItem[], sellerNote: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, sellerNote }));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sellerNote, setSellerNoteState] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    setItems(stored.items);
    setSellerNoteState(stored.sellerNote);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveToStorage(items, sellerNote);
  }, [mounted, items, sellerNote]);

  const setSellerNote = useCallback((note: string) => {
    setSellerNoteState(note);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${item.productSlug}-${item.target}-${Date.now()}`;
    setItems((prev) => [...prev, { ...item, id }]);
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSellerNoteState("");
  }, []);

  const itemCount = items.length;

  const value: CartContextValue = {
    items,
    itemCount,
    sellerNote,
    setSellerNote,
    addItem,
    removeItem,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
