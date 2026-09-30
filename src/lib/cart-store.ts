export type CartLine = {
  /**
   * Product id only. Never a price, never a total — those are resolved on the
   * server at checkout from the catalogue.
   */
  productId: string;
  quantity: number;
};

const STORAGE_KEY = "blanc-weddings-cart-v2";

/** Stable empty snapshot — components rely on referential equality. */
const EMPTY: readonly CartLine[] = Object.freeze([]);

let snapshot: readonly CartLine[] = EMPTY;
let clientReady = false;
const listeners = new Set<() => void>();

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === "string" &&
    typeof line.quantity === "number" &&
    line.quantity > 0
  );
}

function readStorage(): readonly CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const lines = parsed.filter(isCartLine);
    return lines.length > 0 ? lines : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: readonly CartLine[]) {
  snapshot = next.length > 0 ? next : EMPTY;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable (private browsing) — the cart still works in-session.
  }
  emit();
}

/** Hydrate lazily on first subscribe: no effects, no hydration mismatch. */
function ensureClient() {
  if (clientReady) return;
  clientReady = true;
  snapshot = readStorage();
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = readStorage();
    emit();
  });
}

export function subscribe(listener: () => void) {
  ensureClient();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): readonly CartLine[] {
  return snapshot;
}

export function getServerSnapshot(): readonly CartLine[] {
  return EMPTY;
}

export function addToCart(productId: string, quantity = 1) {
  const existing = snapshot.find((line) => line.productId === productId);
  commit(
    existing
      ? snapshot.map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        )
      : [...snapshot, { productId, quantity }],
  );
}

export function removeFromCart(productId: string) {
  commit(snapshot.filter((line) => line.productId !== productId));
}

/**
 * Sets a line's quantity. Values below 1 remove the line.
 * The store keeps product id + quantity only — never a price.
 */
export function updateQuantity(productId: string, quantity: number) {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }
  commit(
    snapshot.map((line) =>
      line.productId === productId
        ? { ...line, quantity: Math.floor(quantity) }
        : line,
    ),
  );
}

export function clearCart() {
  commit(EMPTY);
}
