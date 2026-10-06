package com.sales.ai.inpowered.model.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sales.ai.inpowered.data.CustomerRepository;
import com.sales.ai.inpowered.data.ProductRepository;
import com.sales.ai.inpowered.data.SaleRepository;
import com.sales.ai.inpowered.data.SellerRepository;
import com.sales.ai.inpowered.exception.BusinessException;
import com.sales.ai.inpowered.exception.NotFoundException;
import com.sales.ai.inpowered.model.dto.SaleItemRequest;
import com.sales.ai.inpowered.model.dto.SaleRequest;
import com.sales.ai.inpowered.model.dto.SaleResponse;
import com.sales.ai.inpowered.model.entity.Product;
import com.sales.ai.inpowered.model.entity.Sale;
import com.sales.ai.inpowered.model.entity.SaleItem;
import com.sales.ai.inpowered.model.entity.Seller;
import com.sales.ai.inpowered.security.AuthenticatedUser;

/**
 * Sales CRUD. Administrators manage every sale; sellers only see and change their own.
 */
@Service
@Transactional
public class SaleService {

	private final SaleRepository sales;

	private final SellerRepository sellers;

	private final CustomerRepository customers;

	private final ProductRepository products;

	public SaleService(SaleRepository sales, SellerRepository sellers, CustomerRepository customers,
			ProductRepository products) {
		this.sales = sales;
		this.sellers = sellers;
		this.customers = customers;
		this.products = products;
	}

	@Transactional(readOnly = true)
	public List<SaleResponse> list(AuthenticatedUser user) {
		List<Sale> result = user.isAdmin() ? sales.findAllWithDetails()
				: sales.findAllWithDetailsBySellerId(sellerOf(user).getId());
		return result.stream().map(SaleResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public SaleResponse get(Integer id, AuthenticatedUser user) {
		return SaleResponse.from(findVisible(id, user));
	}

	public SaleResponse create(SaleRequest request, AuthenticatedUser user) {
		Sale sale = new Sale();
		apply(sale, request, user);
		return SaleResponse.from(sales.save(sale));
	}

	public SaleResponse update(Integer id, SaleRequest request, AuthenticatedUser user) {
		Sale sale = findVisible(id, user);
		apply(sale, request, user);
		return SaleResponse.from(sales.save(sale));
	}

	public void delete(Integer id, AuthenticatedUser user) {
		sales.delete(findVisible(id, user));
	}

	private Sale findVisible(Integer id, AuthenticatedUser user) {
		Sale sale = sales.findWithDetailsById(id).orElseThrow(() -> saleNotFound(id));
		if (!user.isAdmin() && !sale.getSeller().getId().equals(sellerOf(user).getId())) {
			// Same answer as a missing sale, so sellers cannot probe other sellers' sales.
			throw saleNotFound(id);
		}
		return sale;
	}

	private void apply(Sale sale, SaleRequest request, AuthenticatedUser user) {
		sale.setSeller(resolveSeller(request, user));
		sale.setCustomer(customers.findById(request.customerId())
			.orElseThrow(() -> new BusinessException("Customer " + request.customerId() + " does not exist.")));
		sale.setSaleDate(request.saleDate());
		sale.setNotes(blankToNull(request.notes()));
		replaceItems(sale, request.items());
		sale.recalculateTotal();
	}

	private Seller resolveSeller(SaleRequest request, AuthenticatedUser user) {
		if (!user.isAdmin()) {
			return sellerOf(user);
		}
		if (request.sellerId() == null) {
			throw new BusinessException("Seller is required.");
		}
		return sellers.findById(request.sellerId())
			.filter(Seller::isActive)
			.orElseThrow(() -> new BusinessException("Seller " + request.sellerId() + " does not exist."));
	}

	/**
	 * Replaces the sale items. Products already in the sale keep the unit price they were
	 * sold at; new products take the current catalog price.
	 */
	private void replaceItems(Sale sale, List<SaleItemRequest> requested) {
		Set<Integer> productIds = new HashSet<>();
		for (SaleItemRequest item : requested) {
			if (!productIds.add(item.productId())) {
				throw new BusinessException("Each product can appear only once in a sale.");
			}
		}
		Map<Integer, Product> catalog = products.findAllById(productIds)
			.stream()
			.collect(Collectors.toMap(Product::getId, Function.identity()));
		if (catalog.size() != productIds.size()) {
			throw new BusinessException("One or more products do not exist.");
		}
		Map<Integer, SaleItem> existing = sale.getItems()
			.stream()
			.collect(Collectors.toMap(item -> item.getProduct().getId(), Function.identity()));

		sale.getItems().removeIf(item -> !productIds.contains(item.getProduct().getId()));
		for (SaleItemRequest requestedItem : requested) {
			SaleItem item = existing.get(requestedItem.productId());
			if (item == null) {
				Product product = catalog.get(requestedItem.productId());
				item = new SaleItem();
				item.setProduct(product);
				item.setUnitPrice(product.getPrice());
				sale.addItem(item);
			}
			item.setQuantity(requestedItem.quantity());
		}
	}

	private Seller sellerOf(AuthenticatedUser user) {
		return sellers.findByUserId(user.userId())
			.filter(Seller::isActive)
			.orElseThrow(() -> new BusinessException("Your user is not linked to an active seller."));
	}

	private static NotFoundException saleNotFound(Integer id) {
		return new NotFoundException("Sale " + id + " not found.");
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

}
