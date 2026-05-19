package com.healthtracker.api.user.api;

import com.healthtracker.api.user.domain.UserAccount;
import com.healthtracker.api.user.service.UserLoginService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;

public final class UserDtos {

    private UserDtos() {
    }

    public record LoginRequest(
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9._-]{3,30}$")
        String loginId
    ) {
    }

    public record LoginResponse(
        String id,
        String loginId,
        String displayName,
        boolean created,
        Instant createdAt,
        Instant lastLoginAt
    ) {
        public static LoginResponse from(UserLoginService.LoginResult result) {
            UserAccount user = result.user();
            return new LoginResponse(
                user.getId(),
                user.getLoginId(),
                user.getDisplayName(),
                result.created(),
                user.getCreatedAt(),
                user.getLastLoginAt()
            );
        }
    }
}
