package com.sales.ai.inpowered.model.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sales.ai.inpowered.data.AppUserRepository;
import com.sales.ai.inpowered.exception.InvalidCredentialsException;
import com.sales.ai.inpowered.model.dto.LoginRequest;
import com.sales.ai.inpowered.model.dto.LoginResponse;
import com.sales.ai.inpowered.model.dto.UserResponse;
import com.sales.ai.inpowered.model.entity.AppUser;
import com.sales.ai.inpowered.security.TokenService;

@Service
public class AuthService {

	private final AppUserRepository users;

	private final PasswordEncoder passwordEncoder;

	private final TokenService tokenService;

	public AuthService(AppUserRepository users, PasswordEncoder passwordEncoder, TokenService tokenService) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
		this.tokenService = tokenService;
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {
		AppUser user = users.findByEmailIgnoreCase(request.email().trim())
			.filter(AppUser::isActive)
			.filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
			.orElseThrow(InvalidCredentialsException::new);
		TokenService.IssuedToken token = tokenService.issue(user);
		return new LoginResponse(token.value(), token.expiresAt(), UserResponse.from(user));
	}

}
