package com.healthtracker.api.workout.domain;

import com.healthtracker.api.exercise.domain.Exercise;
import com.healthtracker.api.exercise.domain.MuscleGroup;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class WorkoutRecord {

    private String recordId;

    private String exerciseId;

    private int catalogId;

    private String exerciseName;

    private MuscleGroup muscleGroup;

    private String muscleGroupLabel;

    private String movementPattern;

    private String note;

    private List<WorkoutSet> sets;

    private Instant createdAt;

    protected WorkoutRecord() {
    }

    private WorkoutRecord(
        Exercise exercise,
        String note,
        List<WorkoutSet> sets,
        Instant createdAt
    ) {
        this.recordId = UUID.randomUUID().toString();
        this.exerciseId = exercise.getId();
        this.catalogId = exercise.getCatalogId();
        this.exerciseName = exercise.getName();
        this.muscleGroup = exercise.getMuscleGroup();
        this.muscleGroupLabel = exercise.getMuscleGroupLabel();
        this.movementPattern = exercise.getMovementPattern();
        this.note = note;
        this.sets = sets;
        this.createdAt = createdAt;
    }

    public static WorkoutRecord from(Exercise exercise, String note, List<WorkoutSet> sets) {
        return new WorkoutRecord(exercise, note, sets, Instant.now());
    }

    public String getRecordId() {
        return recordId;
    }

    public String getExerciseId() {
        return exerciseId;
    }

    public int getCatalogId() {
        return catalogId;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public String getMuscleGroupLabel() {
        return muscleGroupLabel;
    }

    public String getMovementPattern() {
        return movementPattern;
    }

    public String getNote() {
        return note;
    }

    public List<WorkoutSet> getSets() {
        return sets;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
