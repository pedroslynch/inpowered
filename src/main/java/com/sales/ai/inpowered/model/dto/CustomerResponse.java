package com.sales.ai.inpowered.model.dto;

import com.sales.ai.inpowered.model.entity.Customer;

public record CustomerResponse(Integer id, String name, String email) {

	public static CustomerResponse from(Customer customer) {
		return new CustomerResponse(customer.getId(), customer.getName(), customer.getEmail());
	}

}
