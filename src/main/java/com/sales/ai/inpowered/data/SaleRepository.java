package com.sales.ai.inpowered.data;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.sales.ai.inpowered.model.entity.Sale;

public interface SaleRepository extends JpaRepository<Sale, Integer> {

	/** Loads each sale with its seller, customer and items (with products) in a single query. */
	String WITH_DETAILS = """
			select distinct s from Sale s
			join fetch s.seller
			join fetch s.customer
			left join fetch s.items i
			left join fetch i.product
			""";

	String NEWEST_FIRST = " order by s.saleDate desc, s.id desc";

	@Query(WITH_DETAILS + NEWEST_FIRST)
	List<Sale> findAllWithDetails();

	@Query(WITH_DETAILS + " where s.seller.id = :sellerId" + NEWEST_FIRST)
	List<Sale> findAllWithDetailsBySellerId(Integer sellerId);

	@Query(WITH_DETAILS + " where s.id = :id")
	Optional<Sale> findWithDetailsById(Integer id);

}
