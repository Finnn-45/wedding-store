"use client";

import { useSyncExternalStore } from "react";
import {
  addToCart,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeFromCart,
  subscribe,
  updateQuantity,
} from "@/lib/cart-store";

/**
 * Reads the digital cart from the external store. The server snapshot is
 * empty, so the first client render always matches the server HTML.
 */
export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    lines,
    count: lines.reduce((total, line) => total + line.quantity, 0),
    add: addToCart,
    remove: removeFromCart,
    update: updateQuantity,
    clear: clearCart,
  };
}

const noopSubscribe = () => () => {};

/**
 * False during SSR and the hydration render, true afterwards.
 * Lets cart views hold an empty shell instead of flashing "empty cart".
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

