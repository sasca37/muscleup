package com.healthtracker.api.exercise.service;

public class InvalidExerciseRequestException extends RuntimeException {

    public InvalidExerciseRequestException(String message) {
        super(message);
    }
}
