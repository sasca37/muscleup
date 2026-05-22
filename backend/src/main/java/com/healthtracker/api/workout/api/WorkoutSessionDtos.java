package com.healthtracker.api.workout.api;

import com.healthtracker.api.exercise.domain.MuscleGroup;
import com.healthtracker.api.workout.domain.WorkoutRecord;
import com.healthtracker.api.workout.domain.WorkoutSession;
import com.healthtracker.api.workout.domain.WorkoutSessionStatus;
import com.healthtracker.api.workout.domain.WorkoutSet;
import com.healthtracker.api.workout.service.WorkoutSessionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class WorkoutSessionDtos {

    private WorkoutSessionDtos() {
    }

    public record StartSessionRequest(
        String workoutDate,
        String memo
    ) {
    }

    public record AddRecordRequest(
        @NotNull
        Integer catalogId,
        String note,
        @Valid
        List<SetRequest> sets
    ) {
    }

    public record SetRequest(
        @Min(1)
        Integer setOrder,
        @NotNull
        @DecimalMin("0.0")
        BigDecimal weightKg,
        @NotNull
        @Min(1)
        Integer reps,
        Boolean completed
    ) {
        WorkoutSessionService.WorkoutSetInput toInput() {
            return new WorkoutSessionService.WorkoutSetInput(
                setOrder,
                weightKg,
                reps,
                completed != null && completed
            );
        }
    }

    public record WorkoutSessionResponse(
        String id,
        String userId,
        String workoutDate,
        WorkoutSessionStatus status,
        Instant startedAt,
        Instant finishedAt,
        Long durationSeconds,
        String memo,
        List<WorkoutRecordResponse> records,
        Instant createdAt,
        Instant updatedAt
    ) {
        public static WorkoutSessionResponse from(WorkoutSession session) {
            return new WorkoutSessionResponse(
                session.getId(),
                session.getUserId(),
                session.getWorkoutDate(),
                session.getStatus(),
                session.getStartedAt(),
                session.getFinishedAt(),
                session.getDurationSeconds(),
                session.getMemo(),
                session.getRecords().stream()
                    .map(WorkoutRecordResponse::from)
                    .toList(),
                session.getCreatedAt(),
                session.getUpdatedAt()
            );
        }
    }

    public record WorkoutRecordResponse(
        String id,
        int machineId,
        String machineName,
        String recordId,
        String exerciseId,
        int catalogId,
        String exerciseName,
        MuscleGroup muscleGroup,
        String muscleGroupLabel,
        String movementPattern,
        String note,
        List<WorkoutSetResponse> sets,
        Instant createdAt
    ) {
        static WorkoutRecordResponse from(WorkoutRecord record) {
            return new WorkoutRecordResponse(
                record.getRecordId(),
                record.getCatalogId(),
                record.getExerciseName(),
                record.getRecordId(),
                record.getExerciseId(),
                record.getCatalogId(),
                record.getExerciseName(),
                record.getMuscleGroup(),
                record.getMuscleGroupLabel(),
                record.getMovementPattern(),
                record.getNote(),
                record.getSets().stream()
                    .map(WorkoutSetResponse::from)
                    .toList(),
                record.getCreatedAt()
            );
        }
    }

    public record WorkoutSetResponse(
        int setOrder,
        BigDecimal weightKg,
        int reps,
        boolean completed
    ) {
        static WorkoutSetResponse from(WorkoutSet set) {
            return new WorkoutSetResponse(
                set.getSetOrder(),
                set.getWeightKg(),
                set.getReps(),
                set.isCompleted()
            );
        }
    }
}
