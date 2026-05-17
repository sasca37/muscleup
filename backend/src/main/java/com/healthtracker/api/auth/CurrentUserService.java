package com.healthtracker.api.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class CurrentUserService {

    private final UserAccountRepository userAccountRepository;
    private final boolean devAuthEnabled;

    public CurrentUserService(
        UserAccountRepository userAccountRepository,
        @Value("${app.dev-auth-enabled}") boolean devAuthEnabled
    ) {
        this.userAccountRepository = userAccountRepository;
        this.devAuthEnabled = devAuthEnabled;
    }

    @Transactional
    public UserAccount resolve(OAuth2AuthenticationToken authentication) {
        if (authentication == null) {
            if (!devAuthEnabled) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            }
            return userAccountRepository.findByProviderAndProviderId("dev", "local")
                .orElseGet(() -> userAccountRepository.save(new UserAccount(
                    "dev",
                    "local",
                    "dev@local.test",
                    "Dev User"
                )));
        }

        OAuth2User principal = authentication.getPrincipal();
        String provider = authentication.getAuthorizedClientRegistrationId();
        String providerId = resolveProviderId(provider, principal);
        String email = resolveEmail(provider, principal);
        String displayName = resolveDisplayName(provider, principal);

        return userAccountRepository.findByProviderAndProviderId(provider, providerId)
            .map(existing -> {
                existing.updateProfile(email, displayName);
                return existing;
            })
            .orElseGet(() -> userAccountRepository.save(new UserAccount(provider, providerId, email, displayName)));
    }

    private String resolveProviderId(String provider, OAuth2User principal) {
        if ("kakao".equals(provider)) {
            return String.valueOf(principal.getAttribute("id"));
        }
        return principal.getName();
    }

    @SuppressWarnings("unchecked")
    private String resolveEmail(String provider, OAuth2User principal) {
        if ("kakao".equals(provider)) {
            Map<String, Object> kakaoAccount = principal.getAttribute("kakao_account");
            Object email = kakaoAccount == null ? null : kakaoAccount.get("email");
            return email == null ? null : String.valueOf(email);
        }
        return principal.getAttribute("email");
    }

    @SuppressWarnings("unchecked")
    private String resolveDisplayName(String provider, OAuth2User principal) {
        if ("kakao".equals(provider)) {
            Map<String, Object> properties = principal.getAttribute("properties");
            Object nickname = properties == null ? null : properties.get("nickname");
            return nickname == null ? "Kakao User" : String.valueOf(nickname);
        }
        String name = principal.getAttribute("name");
        return name == null ? "User" : name;
    }
}
