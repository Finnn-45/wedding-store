/**
 * Composition root for the data access layer.
 *
 * The UI imports repository TYPES and this module's singletons — never the
 * mock implementations directly. To move to Supabase later, swap the three
 * bindings below for their Supabase counterparts; no component changes.
 *
 * Server only: client components must never import this module (the order and
 * purchase-access repositories touch the file system).
 */
import { mockOrderRepository } from "@/lib/mock/order-repository";
import { mockProductRepository } from "@/lib/mock/product-repository";
import { mockPurchaseAccessRepository } from "@/lib/mock/purchase-access-repository";
import type {
  OrderRepository,
  PurchaseAccessRepository,
} from "@/lib/repositories/order-repository";
import type { ProductRepository } from "@/lib/repositories/product-repository";

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

export const productRepository: ProductRepository = mockProductRepository;
export const orderRepository: OrderRepository = mockOrderRepository;
export const purchaseAccessRepository: PurchaseAccessRepository =
  mockPurchaseAccessRepository;

