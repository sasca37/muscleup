package com.healthtracker.api.exercise.api;

import com.healthtracker.api.exercise.domain.Exercise;
import com.healthtracker.api.exercise.domain.MuscleGroup;

public class ExerciseDtos {

    private ExerciseDtos() {
    }

    public record ExerciseResponse(
        int id,
        String mongoId,
        String name,
        MuscleGroup muscleGroup,
        String muscleGroupLabel,
        String movementPattern,
        String description
    ) {
        public static ExerciseResponse from(Exercise exercise) {
            return new ExerciseResponse(
                exercise.getCatalogId(),
                exercise.getId(),
                exercise.getName(),
                exercise.getMuscleGroup(),
                exercise.getMuscleGroupLabel(),
                exercise.getMovementPattern(),
                exercise.getDescription()
            );
        }
    }
}
