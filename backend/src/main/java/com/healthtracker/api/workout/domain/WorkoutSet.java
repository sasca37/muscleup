package com.healthtracker.api.workout.domain;

import java.math.BigDecimal;

public class WorkoutSet {

    private int setOrder;

    private BigDecimal weightKg;

    private int reps;

    private boolean completed;

    protected WorkoutSet() {
    }

    private WorkoutSet(int setOrder, BigDecimal weightKg, int reps, boolean completed) {
        this.setOrder = setOrder;
        this.weightKg = weightKg;
        this.reps = reps;
        this.completed = completed;
    }

    public static WorkoutSet of(int setOrder, BigDecimal weightKg, int reps, boolean completed) {
        return new WorkoutSet(setOrder, weightKg, reps, completed);
    }

    public int getSetOrder() {
        return setOrder;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public int getReps() {
        return reps;
    }

    public boolean isCompleted() {
        return completed;
    }
}
