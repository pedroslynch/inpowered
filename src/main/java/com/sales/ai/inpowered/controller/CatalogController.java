package com.sales.ai.inpowered.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sales.ai.inpowered.model.dto.CustomerResponse;
import com.sales.ai.inpowered.model.dto.ProductResponse;
import com.sales.ai.inpowered.model.dto.SellerResponse;
import com.sales.ai.inpowered.model.service.CatalogService;

/** Lookups for the sales form. Access per path is defined in SecurityConfig. */
@RestController
@RequestMapping("/api")
public class CatalogController {

	private final CatalogService catalogService;

	public CatalogController(CatalogService catalogService) {
		this.catalogService = catalogService;
	}

	@GetMapping("/customers")
	public List<CustomerResponse> customers() {
		return catalogService.listCustomers();
	}

	@GetMapping("/products")
	public List<ProductResponse> products() {
		return catalogService.listProducts();
	}

	@GetMapping("/sellers")
	public List<SellerResponse> sellers() {
		return catalogService.listActiveSellers();
	}

}
