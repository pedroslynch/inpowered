package com.sales.ai.inpowered.model.dto;

import java.math.BigDecimal;

import com.sales.ai.inpowered.model.entity.SaleItem;

public record SaleItemResponse(Integer id, Integer productId, String productName, String brand, Integer quantity,
		BigDecimal unitPrice, BigDecimal subtotal) {

	public static SaleItemResponse from(SaleItem item) {
		return new SaleItemResponse(item.getId(), item.getProduct().getId(), item.getProduct().getName(),
				item.getProduct().getBrand(), item.getQuantity(), item.getUnitPrice(), item.getSubtotal());
	}

}
