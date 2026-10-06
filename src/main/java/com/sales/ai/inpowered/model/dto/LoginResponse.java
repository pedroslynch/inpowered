package com.sales.ai.inpowered.model.dto;

import java.time.Instant;

public record LoginResponse(String token, Instant expiresAt, UserResponse user) {
}
