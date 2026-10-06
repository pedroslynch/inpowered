package com.sales.ai.inpowered.controller;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;
import com.sales.ai.inpowered.TestcontainersConfiguration;

/**
 * End-to-end tests of authentication and the sales CRUD against PostgreSQL, using the
 * sample data from db/seed. Each test is rolled back.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class SaleApiIntegrationTests {

	private static final String ADMIN = "admin@inpowered.ai";

	private static final String MARIA = "maria.silva@inpowered.ai";

	private static final String JOHN = "john.carter@inpowered.ai";

	@Autowired
	private MockMvc mockMvc;

	@Test
	void loginReturnsTokenAndUser() throws Exception {
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content(credentials(ADMIN, "Admin@123")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.token").isNotEmpty())
			.andExpect(jsonPath("$.user.role").value("ADMIN"));
	}

	@Test
	void loginWithWrongPasswordIsRejected() throws Exception {
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content(credentials(ADMIN, "wrong")))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void salesRequireAuthentication() throws Exception {
		mockMvc.perform(get("/api/sales")).andExpect(status().isUnauthorized());
	}

	@Test
	void adminSeesTheThreeSampleSales() throws Exception {
		mockMvc.perform(get("/api/sales").header(HttpHeaders.AUTHORIZATION, bearer(ADMIN, "Admin@123")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(3)))
			.andExpect(jsonPath("$[2].customer.name").value("Acme Retail Ltd."))
			.andExpect(jsonPath("$[2].totalAmount").value(16299.60))
			.andExpect(jsonPath("$[2].items", hasSize(2)));
	}

	@Test
	void sellerSeesOnlyOwnSales() throws Exception {
		mockMvc.perform(get("/api/sales").header(HttpHeaders.AUTHORIZATION, bearer(MARIA, "Seller@123")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(2)))
			.andExpect(jsonPath("$[*].seller.name", everyItem(is("Maria Silva"))));
	}

	@Test
	void sellerCannotReadAnotherSellersSale() throws Exception {
		String john = bearer(JOHN, "Seller@123");
		Integer mariasSale = firstSaleId(bearer(MARIA, "Seller@123"));
		mockMvc.perform(get("/api/sales/" + mariasSale).header(HttpHeaders.AUTHORIZATION, john))
			.andExpect(status().isNotFound());
		mockMvc.perform(delete("/api/sales/" + mariasSale).header(HttpHeaders.AUTHORIZATION, john))
			.andExpect(status().isNotFound());
	}

	@Test
	void sellerCannotListSellers() throws Exception {
		mockMvc.perform(get("/api/sellers").header(HttpHeaders.AUTHORIZATION, bearer(JOHN, "Seller@123")))
			.andExpect(status().isForbidden());
	}

	@Test
	void sellerCreatesSaleAlwaysAssignedToThemselves() throws Exception {
		String body = """
				{"sellerId": %d, "customerId": %d, "saleDate": "2026-10-03",
				 "items": [{"productId": %d, "quantity": 3}]}
				""".formatted(firstId("/api/sellers", bearer(ADMIN, "Admin@123")),
				firstId("/api/customers", bearer(JOHN, "Seller@123")), productId("Wireless Mouse"));
		mockMvc.perform(post("/api/sales").header(HttpHeaders.AUTHORIZATION, bearer(JOHN, "Seller@123"))
			.contentType(MediaType.APPLICATION_JSON)
			.content(body))
			.andExpect(status().isCreated())
			.andExpect(header().exists(HttpHeaders.LOCATION))
			.andExpect(jsonPath("$.seller.name").value("John Carter"))
			.andExpect(jsonPath("$.totalAmount").value(749.70));
	}

	@Test
	void adminUpdatesAndDeletesSale() throws Exception {
		String admin = bearer(ADMIN, "Admin@123");
		Integer saleId = firstSaleId(admin);
		String body = """
				{"sellerId": %d, "customerId": %d, "saleDate": "2026-10-03", "notes": "Updated",
				 "items": [{"productId": %d, "quantity": 2}]}
				""".formatted(firstId("/api/sellers", admin), firstId("/api/customers", admin),
				productId("Mechanical Keyboard"));
		mockMvc.perform(put("/api/sales/" + saleId).header(HttpHeaders.AUTHORIZATION, admin)
			.contentType(MediaType.APPLICATION_JSON)
			.content(body))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.notes").value("Updated"))
			.andExpect(jsonPath("$.items", hasSize(1)))
			.andExpect(jsonPath("$.totalAmount").value(1398.00));

		mockMvc.perform(delete("/api/sales/" + saleId).header(HttpHeaders.AUTHORIZATION, admin))
			.andExpect(status().isNoContent());
		mockMvc.perform(get("/api/sales/" + saleId).header(HttpHeaders.AUTHORIZATION, admin))
			.andExpect(status().isNotFound());
	}

	@Test
	void invalidSaleReportsFieldErrors() throws Exception {
		mockMvc.perform(post("/api/sales").header(HttpHeaders.AUTHORIZATION, bearer(ADMIN, "Admin@123"))
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"items\": []}"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errors.customerId").exists())
			.andExpect(jsonPath("$.errors.items").exists());
	}

	@Test
	void duplicatedProductIsRejected() throws Exception {
		String admin = bearer(ADMIN, "Admin@123");
		int product = productId("Laptop Pro 14");
		String body = """
				{"sellerId": %d, "customerId": %d, "saleDate": "2026-10-03",
				 "items": [{"productId": %d, "quantity": 1}, {"productId": %d, "quantity": 2}]}
				""".formatted(firstId("/api/sellers", admin), firstId("/api/customers", admin), product, product);
		mockMvc.perform(post("/api/sales").header(HttpHeaders.AUTHORIZATION, admin)
			.contentType(MediaType.APPLICATION_JSON)
			.content(body))
			.andExpect(status().isUnprocessableContent());
	}

	private String bearer(String email, String password) throws Exception {
		String response = mockMvc
			.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content(credentials(email, password)))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();
		return "Bearer " + JsonPath.read(response, "$.token");
	}

	private Integer firstSaleId(String authorization) throws Exception {
		return firstId("/api/sales", authorization);
	}

	private Integer firstId(String path, String authorization) throws Exception {
		String response = mockMvc.perform(get(path).header(HttpHeaders.AUTHORIZATION, authorization))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();
		return JsonPath.read(response, "$[0].id");
	}

	private int productId(String name) throws Exception {
		String response = mockMvc
			.perform(get("/api/products").header(HttpHeaders.AUTHORIZATION, bearer(ADMIN, "Admin@123")))
			.andReturn()
			.getResponse()
			.getContentAsString();
		return JsonPath.<java.util.List<Integer>>read(response, "$[?(@.name == '" + name + "')].id").get(0);
	}

	private static String credentials(String email, String password) {
		return "{\"email\": \"%s\", \"password\": \"%s\"}".formatted(email, password);
	}

}
