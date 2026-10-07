package com.sales.ai.inpowered.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.sales.ai.inpowered.controller.HelloController;

@WebMvcTest(HelloController.class)
@Import(SecurityConfig.class)
class SecurityConfigTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void pathsOutsideApiArePublic() throws Exception {
		// No Angular build on the test classpath, so the page is not found, but it is not blocked either.
		mockMvc.perform(get("/sales/12/edit"))
			.andExpect(status().isNotFound());
	}

	@Test
	void pagesCanOnlyBeFramedByTheAppItself() throws Exception {
		mockMvc.perform(get("/about"))
			.andExpect(header().string("X-Frame-Options", "SAMEORIGIN"));
	}

	@Test
	void unknownApiPathsStillRequireAuthentication() throws Exception {
		mockMvc.perform(get("/api/anything"))
			.andExpect(status().isUnauthorized());
	}

}
