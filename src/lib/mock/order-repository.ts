import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  Order,
  OrderRepository,
} from "@/lib/repositories/order-repository";

/**
 * Mock order storage: a git-ignored JSON file on the server. It behaves like
 * a database — awaitable, server-only, keyed by reference — so swapping in
 * Supabase later only means re-implementing `OrderRepository`.
 *
 * Intentionally NOT localStorage: orders are business data and must never be
 * written by (or trusted from) the browser.
 */
const DATA_DIR = path.join(process.cwd(), ".blanc-data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function readAll(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

/** Hard ceiling on stored orders — the file can never grow without bound. */
const MAX_ORDERS = 500;

/** Serialises read→push→write so concurrent checkouts cannot lose each other. */
let writeQueue: Promise<void> = Promise.resolve();

async function writeAll(orders: Order[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file first, then rename: a reader can never observe a
  // half-written JSON document.
  const tmp = `${ORDERS_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(orders, null, 2), "utf8");
  await fs.rename(tmp, ORDERS_FILE);
}

export const mockOrderRepository: OrderRepository = {
  async create(order) {
    const task = writeQueue.catch(() => undefined).then(async () => {
      const orders = await readAll();
      orders.push(order);
      if (orders.length > MAX_ORDERS) {
        orders.splice(0, orders.length - MAX_ORDERS);
      }
      await writeAll(orders);
    });
    writeQueue = task;
    await task;
    return order;
  },

  async getById(id) {
    const orders = await readAll();
    const reference = id.toUpperCase();
    const found = orders.find((order) => order.id?.toUpperCase() === reference);
    return found ?? null;
  },

  async getByOrderNumber(orderNumber) {
    const orders = await readAll();
    const wanted = orderNumber.trim().toUpperCase();
    return (
      orders.find((order) => order.orderNumber?.toUpperCase() === wanted) ?? null
    );
  },

  async getByEmail(email) {
    const orders = await readAll();
    const wanted = email.trim().toLowerCase();
    return orders
      // Defensive: a record written by an older build may lack the field, and
      // one malformed row must never take down the whole purchases page.
      .filter(
        (order) =>
          typeof order.customerEmail === "string" &&
          order.customerEmail.toLowerCase() === wanted,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async count() {
    return (await readAll()).length;
  },
};
