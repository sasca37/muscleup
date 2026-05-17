package com.healthtracker.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        @Value("${app.frontend-url}") String frontendUrl,
        @Value("${app.dev-auth-enabled}") boolean devAuthEnabled,
        ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository
    ) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error", "/h2-console/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/machines/**").access((authentication, context) ->
                    authorizationDecision(devAuthEnabled, authentication.get())
                )
                .requestMatchers("/api/**").access((authentication, context) ->
                    authorizationDecision(devAuthEnabled, authentication.get())
                )
                .anyRequest().permitAll()
            )
            .logout(logout -> logout.logoutSuccessUrl(frontendUrl))
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        if (clientRegistrationRepository.getIfAvailable() != null) {
            http.oauth2Login(oauth -> oauth.defaultSuccessUrl(frontendUrl + "?login=success", true));
        }

        return http.build();
    }

    private AuthorizationDecision authorizationDecision(boolean devAuthEnabled, Authentication authentication) {
        boolean authenticated = authentication != null
            && authentication.isAuthenticated()
            && !(authentication instanceof AnonymousAuthenticationToken);
        return new AuthorizationDecision(devAuthEnabled || authenticated);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-url}") String frontendUrl) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
