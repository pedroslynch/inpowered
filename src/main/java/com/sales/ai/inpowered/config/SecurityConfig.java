package com.sales.ai.inpowered.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import com.sales.ai.inpowered.model.entity.Role;
import com.sales.ai.inpowered.security.JwtClaims;

/**
 * Access rules of the API. Requests are stateless: each one carries the JWT issued at login
 * (see {@link JwtConfig}).
 */
@Configuration
@Import(JwtConfig.class)
public class SecurityConfig {

	private static final String ADMIN = Role.ADMIN.name();

	private static final String SELLER = Role.SELLER.name();

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(AbstractHttpConfigurer::disable)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(HttpMethod.GET, "/api/hello").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
				.requestMatchers("/error").permitAll()
				.requestMatchers("/api/sales/**", "/api/customers/**", "/api/products/**").hasAnyRole(ADMIN, SELLER)
				.requestMatchers("/api/**").hasRole(ADMIN)
				// Everything outside /api is the bundled Angular app (see WebConfig).
				.anyRequest().permitAll())
			.oauth2ResourceServer(oauth2 -> oauth2
				.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
			.httpBasic(basic -> basic.disable())
			.formLogin(form -> form.disable())
			// The Angular /about and /careers routes frame copies of inpowered.ai pages from this same origin.
			.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
			.cors(Customizer.withDefaults());
		return http.build();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/** Turns the token's roles claim into {@code ROLE_ADMIN} / {@code ROLE_SELLER} authorities. */
	private static JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
		authorities.setAuthoritiesClaimName(JwtClaims.ROLES);
		authorities.setAuthorityPrefix("ROLE_");
		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(authorities);
		return converter;
	}

}
