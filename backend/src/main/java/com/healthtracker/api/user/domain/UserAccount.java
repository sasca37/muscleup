package com.healthtracker.api.user.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("users")
public class UserAccount {

    @Id
    private String id;

    @Indexed(unique = true)
    private String loginId;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String passwordHash;

    private String nickname;

    private WorkoutGoal workoutGoal;

    private Gender gender;

    private AgeGroup ageGroup;

    private Instant createdAt;

    private Instant lastLoginAt;

    protected UserAccount() {
    }

    private UserAccount(
        String email,
        String passwordHash,
        String nickname,
        WorkoutGoal workoutGoal,
        Gender gender,
        AgeGroup ageGroup,
        Instant now
    ) {
        this.loginId = email;
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.workoutGoal = workoutGoal;
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.createdAt = now;
        this.lastLoginAt = now;
    }

    public static UserAccount register(
        String email,
        String passwordHash,
        String nickname,
        WorkoutGoal workoutGoal,
        Gender gender,
        AgeGroup ageGroup
    ) {
        Instant now = Instant.now();
        return new UserAccount(email, passwordHash, nickname, workoutGoal, gender, ageGroup, now);
    }

    public void markLoggedIn() {
        this.lastLoginAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getLoginId() {
        return loginId;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getNickname() {
        return nickname;
    }

    public String getDisplayName() {
        return nickname;
    }

    public WorkoutGoal getWorkoutGoal() {
        return workoutGoal;
    }

    public Gender getGender() {
        return gender;
    }

    public AgeGroup getAgeGroup() {
        return ageGroup;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }
}
