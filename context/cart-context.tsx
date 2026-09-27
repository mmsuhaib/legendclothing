"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string; // unique item key e.g. `${productId}-${size}-${color}`
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  lastAddedId: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  shippingFee: number;
  freeShippingThreshold: number;
  shippingLabel: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "legend_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic shipping settings from CMS / database
  const [shippingFee, setShippingFee] = useState<number>(500);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);
  const [shippingLabel, setShippingLabel] = useState<string>("Islandwide Courier Delivery");

  useEffect(() => {
    fetch("/api/cms")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.shipping_settings) {
          const s = data.shipping_settings;
          if (typeof s.fee === "number") setShippingFee(s.fee);
          if (typeof s.freeShippingThreshold === "number") setFreeShippingThreshold(s.freeShippingThreshold);
          if (s.label) setShippingLabel(s.label);
        }
      })
      .catch(() => {});
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [cart, isLoaded]);

  const openCart = React.useCallback(() => setIsOpen(true), []);
  const closeCart = React.useCallback(() => setIsOpen(false), []);
  const toggleCart = React.useCallback(() => setIsOpen((prev) => !prev), []);

  const addToCart = React.useCallback((item: Omit<CartItem, "id">) => {
    const id = `${item.productId}-${item.size}-${item.color}`;
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevCart, { ...item, id }];
    });
    setLastAddedId(id);
    setTimeout(() => {
      setLastAddedId((curr) => (curr === id ? null : curr));
    }, 2800);
    setIsOpen(true);
  }, []);

  const removeFromCart = React.useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = React.useCallback((id: string, quantity: number) => {
    const validQty = Math.floor(quantity);
    if (validQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const maxStock = item.stock && item.stock > 0 ? item.stock : 99;
        const finalQty = Math.min(validQty, maxStock);
        return { ...item, quantity: finalQty };
      })
    );
  }, []);

  const clearCart = React.useCallback(() => {
    setCart([]);
  }, []);

  // Exact 2-decimal financial precision (prevents IEEE-754 floating point distortion)
  const subtotal = React.useMemo(
    () =>
      Math.round(
        cart.reduce((acc, item) => acc + item.price * item.quantity, 0) * 100
      ) / 100,
    [cart]
  );
  const totalItems = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );
  const contextValue = React.useMemo(
    () => ({
      cart,
      isOpen,
      lastAddedId,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      totalItems,
      shippingFee,
      freeShippingThreshold,
      shippingLabel,
    }),
    [
      cart,
      isOpen,
      lastAddedId,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      totalItems,
      shippingFee,
      freeShippingThreshold,
      shippingLabel,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
