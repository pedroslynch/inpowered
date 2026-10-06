package com.sales.ai.inpowered.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sales.ai.inpowered.model.dto.SaleRequest;
import com.sales.ai.inpowered.model.dto.SaleResponse;
import com.sales.ai.inpowered.model.service.SaleService;
import com.sales.ai.inpowered.security.AuthenticatedUser;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

	private final SaleService saleService;

	public SaleController(SaleService saleService) {
		this.saleService = saleService;
	}

	@GetMapping
	public List<SaleResponse> list(@AuthenticationPrincipal Jwt jwt) {
		return saleService.list(AuthenticatedUser.from(jwt));
	}

	@GetMapping("/{id}")
	public SaleResponse get(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
		return saleService.get(id, AuthenticatedUser.from(jwt));
	}

	@PostMapping
	public ResponseEntity<SaleResponse> create(@Valid @RequestBody SaleRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		SaleResponse created = saleService.create(request, AuthenticatedUser.from(jwt));
		return ResponseEntity.created(URI.create("/api/sales/" + created.id())).body(created);
	}

	@PutMapping("/{id}")
	public SaleResponse update(@PathVariable Integer id, @Valid @RequestBody SaleRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return saleService.update(id, request, AuthenticatedUser.from(jwt));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
		saleService.delete(id, AuthenticatedUser.from(jwt));
		return ResponseEntity.noContent().build();
	}

}
