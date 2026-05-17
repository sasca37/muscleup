package com.healthtracker.api.auth;

import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class AuthController {

    private final CurrentUserService currentUserService;

    public AuthController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public MeResponse me(OAuth2AuthenticationToken authentication) {
        UserAccount user = currentUserService.resolve(authentication);
        return new MeResponse(user.getId(), user.getEmail(), user.getDisplayName(), user.getProvider());
    }

    public record MeResponse(Long id, String email, String displayName, String provider) {
    }
}

