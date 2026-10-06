export type Role = 'ADMIN' | 'SELLER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface Seller {
  id: number;
  name: string;
  email: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
}

export interface Product {
  id: number;
  name: string;
  characteristics: string | null;
  brand: string;
  price: number;
  manufacturingDate: string | null;
}

export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  seller: Seller;
  customer: Customer;
  saleDate: string;
  totalAmount: number;
  notes: string | null;
  items: SaleItem[];
}

export interface SaleRequest {
  sellerId: number | null;
  customerId: number;
  saleDate: string;
  notes: string | null;
  items: { productId: number; quantity: number }[];
}

/** RFC 9457 problem returned by the API on errors. */
export interface ApiProblem {
  status: number;
  title: string;
  detail?: string;
  errors?: Record<string, string>;
}
