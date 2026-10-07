export type CartLine = {
  /**
   * Product id only. Never a price, never a total — those are resolved on the
   * server at checkout from the catalogue.
   */
  productId: string;
  quantity: number;
  /**
   * Chosen option VALUE when the product offers one (e.g. "Burgundy").
   * Identity only — the price delta for that choice is resolved server-side
   * at checkout, exactly like every other money value.
   */
  option?: string;
};

/** Matches OPTION_NAME_MAX in src/data/products.ts. */
const OPTION_MAX = 60;

function normaliseOption(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, OPTION_MAX);
  return trimmed || undefined;
}

/** One cart line per product AND per chosen option. */
function matchesLine(
  line: CartLine,
  productId: string,
  option: string | undefined,
): boolean {
  return (
    line.productId === productId && normaliseOption(line.option) === option
  );
}

const STORAGE_KEY = "blanc-weddings-cart-v2";

/** Stable empty snapshot — components rely on referential equality. */
const EMPTY: readonly CartLine[] = Object.freeze([]);

let snapshot: readonly CartLine[] = EMPTY;
let clientReady = false;
const listeners = new Set<() => void>();

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  const option = line.option;
  return (
    typeof line.productId === "string" &&
    typeof line.quantity === "number" &&
    line.quantity > 0 &&
    (option === undefined ||
      (typeof option === "string" &&
        option.length > 0 &&
        option.length <= OPTION_MAX))
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

export function addToCart(
  productId: string,
  quantity = 1,
  option?: string | null,
) {
  const wanted = normaliseOption(option);
  const existing = snapshot.find((line) => matchesLine(line, productId, wanted));
  commit(
    existing
      ? snapshot.map((line) =>
          matchesLine(line, productId, wanted)
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        )
      : [
          ...snapshot,
          wanted
            ? { productId, quantity, option: wanted }
            : { productId, quantity },
        ],
  );
}

export function removeFromCart(productId: string, option?: string | null) {
  const wanted = normaliseOption(option);
  commit(snapshot.filter((line) => !matchesLine(line, productId, wanted)));
}

/**
 * Sets a line's quantity. Values below 1 remove the line.
 * The store keeps product id + quantity + option value only — never a price.
 */
export function updateQuantity(
  productId: string,
  quantity: number,
  option?: string | null,
) {
  if (quantity < 1) {
    removeFromCart(productId, option);
    return;
  }
  const wanted = normaliseOption(option);
  commit(
    snapshot.map((line) =>
      matchesLine(line, productId, wanted)
        ? { ...line, quantity: Math.floor(quantity) }
        : line,
    ),
  );
}

export function clearCart() {
  commit(EMPTY);
}
