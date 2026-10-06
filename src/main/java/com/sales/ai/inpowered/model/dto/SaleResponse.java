package com.sales.ai.inpowered.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.sales.ai.inpowered.model.entity.Sale;

public record SaleResponse(Integer id, SellerResponse seller, CustomerResponse customer, LocalDate saleDate,
		BigDecimal totalAmount, String notes, List<SaleItemResponse> items) {

	public static SaleResponse from(Sale sale) {
		return new SaleResponse(sale.getId(), SellerResponse.from(sale.getSeller()),
				CustomerResponse.from(sale.getCustomer()), sale.getSaleDate(), sale.getTotalAmount(), sale.getNotes(),
				sale.getItems().stream().map(SaleItemResponse::from).toList());
	}

}
