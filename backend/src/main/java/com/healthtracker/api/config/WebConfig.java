package com.healthtracker.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final List<String> allowedOriginPatterns;

    public WebConfig(@Value("${app.frontend-url}") String frontendUrl) {
        this.allowedOriginPatterns = createAllowedOriginPatterns(frontendUrl);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns(allowedOriginPatterns.toArray(String[]::new))
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }

    private List<String> createAllowedOriginPatterns(String frontendUrl) {
        List<String> origins = new ArrayList<>();
        for (String origin : frontendUrl.split(",")) {
            String trimmedOrigin = origin.trim();
            if (!trimmedOrigin.isBlank()) {
                origins.add(trimmedOrigin);
            }
        }
        origins.add("http://localhost:*");
        origins.add("http://127.0.0.1:*");
        return origins.stream().distinct().toList();
    }
}
