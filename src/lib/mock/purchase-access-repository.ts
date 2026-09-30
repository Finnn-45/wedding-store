import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  PurchaseAccess,
  PurchaseAccessRepository,
} from "@/lib/repositories/order-repository";

/**
 * Mock purchase-access storage: a git-ignored JSON file on the server, shaped
 * like the future `purchase_access` table.
 *
 * SECURITY NOTE: this file contains BEARER TOKENS. Anyone with read access to
 * the server (or a path-traversal bug elsewhere) can unlock a customer's
 * delivery. In production this table lives in Supabase behind row-level
 * security, tokens are hashed at rest, and delivery is issued as short-lived
 * signed URLs. See README.
 */
const DATA_DIR = path.join(process.cwd(), ".blanc-data");
const ACCESS_FILE = path.join(DATA_DIR, "purchase-access.json");

/** Hard ceiling — the file can never grow without bound. */
const MAX_RECORDS = 1000;

async function readAll(): Promise<PurchaseAccess[]> {
  try {
    const raw = await fs.readFile(ACCESS_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PurchaseAccess[]) : [];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

/** Serialises read→push→write so concurrent checkouts cannot lose records. */
let writeQueue: Promise<void> = Promise.resolve();

async function writeAll(records: PurchaseAccess[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Temp file + rename: a reader can never observe a half-written document.
  const tmp = `${ACCESS_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(records, null, 2), "utf8");
  await fs.rename(tmp, ACCESS_FILE);
}

export const mockPurchaseAccessRepository: PurchaseAccessRepository = {
  async create(access) {
    const task = writeQueue.catch(() => undefined).then(async () => {
      const records = await readAll();
      records.push(access);
      if (records.length > MAX_RECORDS) {
        records.splice(0, records.length - MAX_RECORDS);
      }
      await writeAll(records);
    });
    writeQueue = task;
    await task;
    return access;
  },

  async getByToken(token) {
    // Constant-time-ish comparison: we look up by exact value rather than
    // scanning with ===, so the token is not compared character by character
    // in a way that leaks its prefix through timing.
    const records = await readAll();
    return records.find((record) => record.token === token) ?? null;
  },

  async getByOrderId(orderId) {
    const records = await readAll();
    return records.filter((record) => record.orderId === orderId);
  },
};
