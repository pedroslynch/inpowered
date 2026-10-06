package com.sales.ai.inpowered.data;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sales.ai.inpowered.model.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {

	List<Product> findAllByOrderByName();

}
