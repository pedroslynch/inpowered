package com.sales.ai.inpowered.data;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sales.ai.inpowered.model.entity.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Integer> {

	Optional<AppUser> findByEmailIgnoreCase(String email);

}
