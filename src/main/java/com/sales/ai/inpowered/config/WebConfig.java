package com.sales.ai.inpowered.config;

import java.io.IOException;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Serves the Angular build bundled in classpath:/static (the Docker image copies it there).
 * Client-side routes such as /sales/12/edit are not files, so they fall back to index.html.
 * Paths under /api and paths that look like files (with an extension) never fall back.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/**")
			.addResourceLocations("classpath:/static/")
			.resourceChain(true)
			.addResolver(new SpaResourceResolver());
	}

	private static class SpaResourceResolver extends PathResourceResolver {

		@Override
		protected Resource getResource(String resourcePath, Resource location) throws IOException {
			if (!resourcePath.isEmpty()) {
				Resource resource = location.createRelative(resourcePath);
				if (resource.exists() && resource.isReadable()) {
					return resource;
				}
				if (resourcePath.startsWith("api/") || resourcePath.contains(".")) {
					return null;
				}
			}
			Resource index = location.createRelative("index.html");
			return index.exists() && index.isReadable() ? index : null;
		}

	}

}
