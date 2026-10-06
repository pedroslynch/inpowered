package com.sales.ai.inpowered.data;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sales.ai.inpowered.model.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

	List<Customer> findAllByOrderByName();

}
