package com.sales.ai.inpowered;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class InpoweredApplicationTests {

	@Test
	void contextLoads() {
	}

}
