package com.sales.ai.inpowered.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sales.ai.inpowered.data.CustomerRepository;
import com.sales.ai.inpowered.data.ProductRepository;
import com.sales.ai.inpowered.data.SellerRepository;
import com.sales.ai.inpowered.model.dto.CustomerResponse;
import com.sales.ai.inpowered.model.dto.ProductResponse;
import com.sales.ai.inpowered.model.dto.SellerResponse;

/** Read-only lookups used by the sales screens. */
@Service
@Transactional(readOnly = true)
public class CatalogService {

	private final CustomerRepository customers;

	private final ProductRepository products;

	private final SellerRepository sellers;

	public CatalogService(CustomerRepository customers, ProductRepository products, SellerRepository sellers) {
		this.customers = customers;
		this.products = products;
		this.sellers = sellers;
	}

	public List<CustomerResponse> listCustomers() {
		return customers.findAllByOrderByName().stream().map(CustomerResponse::from).toList();
	}

	public List<ProductResponse> listProducts() {
		return products.findAllByOrderByName().stream().map(ProductResponse::from).toList();
	}

	public List<SellerResponse> listActiveSellers() {
		return sellers.findByActiveTrueOrderByName().stream().map(SellerResponse::from).toList();
	}

}
