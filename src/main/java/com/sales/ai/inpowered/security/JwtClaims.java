package com.sales.ai.inpowered.security;

/**
 * Names of the custom claims in the tokens issued by {@link TokenService}. The standard claims
 * (issuer, subject = email, issued at, expires at) come from {@code JwtClaimsSet}.
 */
public final class JwtClaims {

	/** Id of the {@code app_user}. */
	public static final String USER_ID = "uid";

	/** Full name of the user. */
	public static final String NAME = "name";

	/** Role names (one per user), read by Spring Security as {@code ROLE_<name>} authorities. */
	public static final String ROLES = "roles";

	private JwtClaims() {
	}

}
