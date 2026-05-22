package com.healthtracker.api.workout.service;

public class InvalidWorkoutSessionRequestException extends RuntimeException {

    public InvalidWorkoutSessionRequestException(String message) {
        super(message);
    }
}
