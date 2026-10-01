/**
 * Composition root for the data access layer — and the ONE place that decides
 * which implementation is live.
 *
 *   Supabase credentials present  → Supabase is the source of truth
 *   No credentials (fresh clone)  → the local mock repositories
 *
 * The UI imports repository TYPES and these singletons, never the
 * implementations. Because both sides satisfy the same interfaces, no
 * component changes when the switch flips, and the two systems can never
 * silently compete with each other.
 *
 * Server only: client components must never import this module.
 */
import { mockOrderRepository } from "@/lib/mock/order-repository";
import { mockProductRepository } from "@/lib/mock/product-repository";
import { mockPurchaseAccessRepository } from "@/lib/mock/purchase-access-repository";
import type {
  OrderRepository,
  PurchaseAccessRepository,
} from "@/lib/repositories/order-repository";
import type { ProductRepository } from "@/lib/repositories/product-repository";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { supabaseOrderRepository } from "@/lib/supabase/repositories/order-repository";
import { supabaseProductRepository } from "@/lib/supabase/repositories/product-repository";
import { supabasePurchaseAccessRepository } from "@/lib/supabase/repositories/purchase-access-repository";

export type {
  Order,
  OrderItem,
  OrderRepository,
  OrderStatus,
  PurchaseAccess,
  PurchaseAccessRepository,
} from "@/lib/repositories/order-repository";
export type {
  Product,
  ProductRepository,
  ProductStyle,
  ProductType,
} from "@/lib/repositories/product-repository";

/** True when Supabase is configured and therefore authoritative. */
export const usingSupabase = isSupabaseConfigured();

export const productRepository: ProductRepository = usingSupabase
  ? supabaseProductRepository
  : mockProductRepository;

export const orderRepository: OrderRepository = usingSupabase
  ? supabaseOrderRepository
  : mockOrderRepository;

export const purchaseAccessRepository: PurchaseAccessRepository = usingSupabase
  ? supabasePurchaseAccessRepository
  : mockPurchaseAccessRepository;

