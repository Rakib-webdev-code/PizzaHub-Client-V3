export type Role = "customer" | "vendor" | "admin";
export type Me = {
  id: string; name: string; email: string; image?: string | null; role: Role; isBlocked: boolean;
  businessName?: string | null; subscriptionPlan: "free" | "premium"; subscriptionExpiresAt?: string | null; cancelAtPeriodEnd?: boolean;
};
export type VendorInfo = { id: string; name: string; businessName?: string | null; image?: string | null; email?: string; isPremium?: boolean; rating?: number; reviewCount?: number };
export type Review = { name: string; image?: string | null; rating: number; comment: string; createdAt: string };
export type ItemStatus = "pending" | "approved" | "rejected" | "inactive";
export type MenuItem = {
  _id: string; vendorId: string; itemName: string; category: string; description: string; price: number; location: string;
  images: string[]; status: ItemStatus; createdAt: string; vendor?: VendorInfo; ratingAvg?: number; ratingCount?: number; reviews?: Review[]; inactiveBy?: string;
};
export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type Order = {
  _id: string; itemId: string; itemName: string; itemImage?: string | null; price: number; deliveryDate: string; deliveryAddress: string;
  message?: string; status: OrderStatus; createdAt: string; history?: { status: string; at: string }[];
  vendor?: VendorInfo; customer?: { id: string; name: string; email: string; image?: string | null };
};
export type Transaction = {
  _id: string; plan: string; amount: number; currency: string; status: string; createdAt: string; stripeSessionId: string;
  vendor?: { name: string; email: string; businessName?: string | null };
};
export type Paged<T> = { items: T[]; total: number; page: number; pages: number };
