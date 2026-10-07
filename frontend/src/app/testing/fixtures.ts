import { LoginResponse, Product, Sale, User } from '../core/models';

export const ADMIN: User = { id: 1, email: 'fernando.sonegheti@inpowered.ai', fullName: 'Fernando Sonegheti', role: 'ADMIN' };
export const SELLER: User = { id: 2, email: 'maria.silva@inpowered.ai', fullName: 'Maria Silva', role: 'SELLER' };

export function loginResponse(user: User, expiresInMs = 3_600_000): LoginResponse {
  return { token: `token-${user.id}`, expiresAt: new Date(Date.now() + expiresInMs).toISOString(), user };
}

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop Pro 14', characteristics: '16 GB RAM', brand: 'Lenovo', price: 7899.9, manufacturingDate: '2026-03-15' },
  { id: 2, name: 'Wireless Mouse', characteristics: null, brand: 'Logitech', price: 249.9, manufacturingDate: null },
];

export const SALES: Sale[] = [
  {
    id: 3,
    seller: { id: 2, name: 'John Carter', email: 'john.carter@inpowered.ai' },
    customer: { id: 3, name: 'Northwind Traders', email: null },
    saleDate: '2026-10-02',
    totalAmount: 7899.9,
    notes: null,
    items: [{ id: 5, productId: 1, productName: 'Laptop Pro 14', brand: 'Lenovo', quantity: 1, unitPrice: 7899.9, subtotal: 7899.9 }],
  },
  {
    id: 1,
    seller: { id: 1, name: 'Maria Silva', email: 'maria.silva@inpowered.ai' },
    customer: { id: 1, name: 'Acme Retail Ltd.', email: 'purchasing@acmeretail.com' },
    saleDate: '2026-09-28',
    totalAmount: 499.8,
    notes: 'Office refresh',
    items: [{ id: 2, productId: 2, productName: 'Wireless Mouse', brand: 'Logitech', quantity: 2, unitPrice: 249.9, subtotal: 499.8 }],
  },
];
