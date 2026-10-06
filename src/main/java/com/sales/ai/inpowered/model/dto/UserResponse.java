package com.sales.ai.inpowered.model.dto;

import com.sales.ai.inpowered.model.entity.AppUser;
import com.sales.ai.inpowered.model.entity.Role;

public record UserResponse(Integer id, String email, String fullName, Role role) {

	public static UserResponse from(AppUser user) {
		return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
	}

}
