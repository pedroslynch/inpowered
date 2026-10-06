package com.sales.ai.inpowered.data;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sales.ai.inpowered.model.entity.Seller;

public interface SellerRepository extends JpaRepository<Seller, Integer> {

	Optional<Seller> findByUserId(Integer userId);

	List<Seller> findByActiveTrueOrderByName();

}
