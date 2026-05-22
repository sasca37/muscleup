package com.healthtracker.api.user.api;

import com.healthtracker.api.user.domain.AgeGroup;
import com.healthtracker.api.user.domain.Gender;
import com.healthtracker.api.user.domain.UserAccount;
import com.healthtracker.api.user.domain.WorkoutGoal;
import com.healthtracker.api.user.service.UserAuthService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class UserDtos {

    private UserDtos() {
    }

    public record RegisterRequest(
        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 8, max = 72)
        String password,

        @NotBlank
        @Size(min = 2, max = 20)
        String nickname,

        @NotNull
        WorkoutGoal workoutGoal,

        @NotNull
        Gender gender,

        @NotNull
        AgeGroup ageGroup
    ) {
    }

    public record LoginRequest(
        @NotBlank
        @Email
        String email,

        @NotBlank
        String password
    ) {
    }

    public record AuthResponse(
        String id,
        String email,
        String loginId,
        String nickname,
        String displayName,
        WorkoutGoal workoutGoal,
        Gender gender,
        AgeGroup ageGroup,
        boolean created,
        Instant createdAt,
        Instant lastLoginAt
    ) {
        public static AuthResponse from(UserAuthService.AuthResult result) {
            UserAccount user = result.user();
            return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getLoginId(),
                user.getNickname(),
                user.getDisplayName(),
                user.getWorkoutGoal(),
                user.getGender(),
                user.getAgeGroup(),
                result.created(),
                user.getCreatedAt(),
                user.getLastLoginAt()
            );
        }
    }
}
