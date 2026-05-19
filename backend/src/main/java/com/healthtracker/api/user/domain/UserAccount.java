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

    private String displayName;

    private Instant createdAt;

    private Instant lastLoginAt;

    protected UserAccount() {
    }

    private UserAccount(String loginId, String displayName, Instant now) {
        this.loginId = loginId;
        this.displayName = displayName;
        this.createdAt = now;
        this.lastLoginAt = now;
    }

    public static UserAccount create(String loginId) {
        Instant now = Instant.now();
        return new UserAccount(loginId, loginId, now);
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

    public String getDisplayName() {
        return displayName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }
}
