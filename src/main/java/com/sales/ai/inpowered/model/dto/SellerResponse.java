package com.sales.ai.inpowered.model.dto;

import com.sales.ai.inpowered.model.entity.Seller;

public record SellerResponse(Integer id, String name, String email) {

	public static SellerResponse from(Seller seller) {
		return new SellerResponse(seller.getId(), seller.getName(), seller.getEmail());
	}

}
