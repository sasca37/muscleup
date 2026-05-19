package com.healthtracker.api.user.service;

import com.healthtracker.api.user.domain.UserAccount;
import com.healthtracker.api.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

@Service
public class UserLoginService {

    private final UserAccountRepository userAccountRepository;

    public UserLoginService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public LoginResult login(String rawLoginId) {
        String loginId = normalize(rawLoginId);
        return userAccountRepository.findByLoginId(loginId)
            .map(user -> {
                user.markLoggedIn();
                return new LoginResult(userAccountRepository.save(user), false);
            })
            .orElseGet(() -> new LoginResult(userAccountRepository.save(UserAccount.create(loginId)), true));
    }

    private String normalize(String rawLoginId) {
        if (rawLoginId == null || rawLoginId.isBlank()) {
            throw new InvalidLoginIdException("loginId는 필수입니다.");
        }

        String loginId = rawLoginId.trim().toLowerCase();
        if (!loginId.matches("^[a-z0-9._-]{3,30}$")) {
            throw new InvalidLoginIdException("loginId는 영문 소문자, 숫자, '.', '_', '-' 조합 3~30자여야 합니다.");
        }

        return loginId;
    }

    public record LoginResult(
        UserAccount user,
        boolean created
    ) {
    }
}
