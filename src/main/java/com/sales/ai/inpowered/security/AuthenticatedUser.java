package com.sales.ai.inpowered.security;

import org.springframework.security.oauth2.jwt.Jwt;

import com.sales.ai.inpowered.model.entity.Role;

/** The signed-in user, as read from the JWT of the current request. */
public record AuthenticatedUser(Integer userId, String email, Role role) {

	public static final String USER_ID_CLAIM = "uid";

	public static AuthenticatedUser from(Jwt jwt) {
		Number userId = jwt.getClaim(USER_ID_CLAIM);
		Role role = Role.valueOf(jwt.getClaimAsStringList("roles").get(0));
		return new AuthenticatedUser(userId.intValue(), jwt.getSubject(), role);
	}

	public boolean isAdmin() {
		return role == Role.ADMIN;
	}

}
