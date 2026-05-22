package com.healthtracker.api.user.service;

public class InvalidUserRequestException extends RuntimeException {

    public InvalidUserRequestException(String message) {
        super(message);
    }
}
