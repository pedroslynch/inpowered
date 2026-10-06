package com.sales.ai.inpowered.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.sales.ai.inpowered.config.SecurityConfig;

@WebMvcTest(HelloController.class)
@Import(SecurityConfig.class)
class HelloControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void helloIsPublic() throws Exception {
		mockMvc.perform(get("/api/hello"))
			.andExpect(status().isOk())
			.andExpect(content().string("Hello! inpowered está no ar."));
	}

}
