package com.sales.ai.inpowered.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SaleItemRequest(@NotNull Integer productId, @NotNull @Min(1) @Max(100000) Integer quantity) {
}
