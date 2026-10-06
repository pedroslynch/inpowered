package com.sales.ai.inpowered.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.sales.ai.inpowered.model.entity.Product;

public record ProductResponse(Integer id, String name, String characteristics, String brand, BigDecimal price,
		LocalDate manufacturingDate) {

	public static ProductResponse from(Product product) {
		return new ProductResponse(product.getId(), product.getName(), product.getCharacteristics(),
				product.getBrand(), product.getPrice(), product.getManufacturingDate());
	}

}
