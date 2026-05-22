package com.healthtracker.api.workout.service;

public class WorkoutSessionNotFoundException extends RuntimeException {

    public WorkoutSessionNotFoundException() {
        super("운동 세션을 찾을 수 없습니다.");
    }
}
