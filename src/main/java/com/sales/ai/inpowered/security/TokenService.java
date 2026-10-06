package com.sales.ai.inpowered.security;

import java.time.Instant;
import java.util.List;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.sales.ai.inpowered.config.JwtProperties;
import com.sales.ai.inpowered.config.SecurityConfig;
import com.sales.ai.inpowered.model.entity.AppUser;

@Service
public class TokenService {

	private final JwtEncoder encoder;

	private final JwtProperties properties;

	public TokenService(JwtEncoder encoder, JwtProperties properties) {
		this.encoder = encoder;
		this.properties = properties;
	}

	public IssuedToken issue(AppUser user) {
		Instant now = Instant.now();
		Instant expiresAt = now.plus(properties.expiration());
		JwtClaimsSet claims = JwtClaimsSet.builder()
			.issuer(properties.issuer())
			.subject(user.getEmail())
			.issuedAt(now)
			.expiresAt(expiresAt)
			.claim(AuthenticatedUser.USER_ID_CLAIM, user.getId())
			.claim("name", user.getFullName())
			.claim(SecurityConfig.ROLES_CLAIM, List.of(user.getRole().name()))
			.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
		return new IssuedToken(token, expiresAt);
	}

	public record IssuedToken(String value, Instant expiresAt) {
	}

}
