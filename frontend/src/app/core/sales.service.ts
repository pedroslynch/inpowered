import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer, Product, Sale, SaleRequest, Seller } from './models';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly http = inject(HttpClient);

  list(): Observable<Sale[]> {
    return this.http.get<Sale[]>('/api/sales');
  }

  get(id: number): Observable<Sale> {
    return this.http.get<Sale>(`/api/sales/${id}`);
  }

  create(request: SaleRequest): Observable<Sale> {
    return this.http.post<Sale>('/api/sales', request);
  }

  update(id: number, request: SaleRequest): Observable<Sale> {
    return this.http.put<Sale>(`/api/sales/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/sales/${id}`);
  }

  customers(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/api/customers');
  }

  products(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }

  /** Admin only. */
  sellers(): Observable<Seller[]> {
    return this.http.get<Seller[]>('/api/sellers');
  }
}
