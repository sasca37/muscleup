package com.healthtracker.api.user.service;

public class DuplicateUserException extends RuntimeException {

    public DuplicateUserException(String message) {
        super(message);
    }
}
