package com.sales.ai.inpowered.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("security.jwt")
public record JwtProperties(String secret, Duration expiration, String issuer) {

	public JwtProperties {
		if (secret == null || secret.length() < 32) {
			throw new IllegalArgumentException("security.jwt.secret must have at least 32 characters");
		}
	}

}
