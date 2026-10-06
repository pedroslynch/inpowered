package com.sales.ai.inpowered.model.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload to create or update a sale. {@code sellerId} is only used for administrators;
 * for sellers the sale is always assigned to the signed-in seller.
 */
public record SaleRequest(Integer sellerId, @NotNull Integer customerId, @NotNull LocalDate saleDate,
		@Size(max = 500) String notes, @NotEmpty @Valid List<SaleItemRequest> items) {
}
