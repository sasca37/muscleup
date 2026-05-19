package com.healthtracker.api.user.service;

public class InvalidLoginIdException extends RuntimeException {

    public InvalidLoginIdException(String message) {
        super(message);
    }
}
