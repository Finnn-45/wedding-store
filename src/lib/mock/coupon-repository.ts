import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  Coupon,
  CouponRepository,
} from "@/lib/repositories/coupon-repository";

/**
 * Mock coupon storage: a git-ignored JSON file on the server, exactly like
 * the mock order repository. Awaitable and server-only, so the Supabase
 * implementation can swap in without changing the checkout service.
 */
const DATA_DIR = path.join(process.cwd(), ".blanc-data");
const COUPONS_FILE = path.join(DATA_DIR, "coupons.json");

async function readAll(): Promise<Coupon[]> {
  try {
    const raw = await fs.readFile(COUPONS_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Coupon[]) : [];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

/** Serialises read→modify→write so concurrent requests cannot lose updates. */
let writeQueue: Promise<void> = Promise.resolve();

async function writeAll(coupons: Coupon[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${COUPONS_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(coupons, null, 2), "utf8");
  await fs.rename(tmp, COUPONS_FILE);
}

function enqueue(mutate: (coupons: Coupon[]) => Promise<void>): Promise<void> {
  const task = writeQueue.catch(() => undefined).then(() =>
    readAll().then((coupons) => mutate(coupons)),
  );
  writeQueue = task;
  return task;
}

function couponId(): string {
  return `coup_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function isUsable(coupon: Coupon): boolean {
  if (!coupon.active) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return false;
  }
  if (
    coupon.maxRedemptions !== null &&
    coupon.redemptions >= coupon.maxRedemptions
  ) {
    return false;
  }
  return true;
}

export const mockCouponRepository: CouponRepository = {
  async findValid(code) {
    const wanted = code.trim().toLowerCase();
    const coupons = await readAll();
    const found = coupons.find((entry) => entry.code.toLowerCase() === wanted);
    return found && isUsable(found) ? found : null;
  },

  async redeem(id) {
    await enqueue(async (coupons) => {
      const found = coupons.find((entry) => entry.id === id);
      if (!found) return;
      found.redemptions = (found.redemptions ?? 0) + 1;
      await writeAll(coupons);
    });
  },

  async list() {
    const coupons = await readAll();
    return coupons
      .slice()
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  },

  async create(input) {
    const code = input.code.trim().toLowerCase();
    let created: Coupon | null = null;
    await enqueue(async (coupons) => {
      if (coupons.some((entry) => entry.code.toLowerCase() === code)) return;
      created = {
        id: couponId(),
        code,
        percentOff: input.percentOff,
        active: true,
        note: input.note ?? null,
        maxRedemptions: input.maxRedemptions ?? null,
        redemptions: 0,
        expiresAt: input.expiresAt ?? null,
        createdAt: new Date().toISOString(),
      };
      coupons.push(created);
      await writeAll(coupons);
    });
    return created;
  },

  async setActive(id, active) {
    let changed = false;
    await enqueue(async (coupons) => {
      const found = coupons.find((entry) => entry.id === id);
      if (!found) return;
      found.active = active;
      changed = true;
      await writeAll(coupons);
    });
    return changed;
  },

  async remove(id) {
    let removed = false;
    await enqueue(async (coupons) => {
      const next = coupons.filter((entry) => entry.id !== id);
      removed = next.length !== coupons.length;
      if (removed) await writeAll(next);
    });
    return removed;
  },
};