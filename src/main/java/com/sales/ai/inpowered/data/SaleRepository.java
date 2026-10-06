package com.sales.ai.inpowered.data;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.sales.ai.inpowered.model.entity.Sale;

public interface SaleRepository extends JpaRepository<Sale, Integer> {

	String FETCH_ALL = """
			select distinct s from Sale s
			join fetch s.seller
			join fetch s.customer
			left join fetch s.items i
			left join fetch i.product
			""";

	@Query(FETCH_ALL + " order by s.saleDate desc, s.id desc")
	List<Sale> findAllWithDetails();

	@Query(FETCH_ALL + " where s.seller.id = :sellerId order by s.saleDate desc, s.id desc")
	List<Sale> findAllWithDetailsBySellerId(Integer sellerId);

	@Query(FETCH_ALL + " where s.id = :id")
	Optional<Sale> findWithDetailsById(Integer id);

}
