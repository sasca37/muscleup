package com.healthtracker.api.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public final class WorkoutDtos {

    private WorkoutDtos() {
    }

    public record CreateWorkoutSessionRequest(
        @NotNull LocalDate workoutDate,
        String memo,
        @NotEmpty @Valid List<CreateWorkoutRecordRequest> records
    ) {
    }

    public record CreateWorkoutRecordRequest(
        @NotNull Long machineId,
        String note,
        @NotEmpty @Valid List<CreateWorkoutSetRequest> sets
    ) {
    }

    public record CreateWorkoutSetRequest(
        @NotNull @DecimalMin("0.0") BigDecimal weightKg,
        @NotNull @Min(1) Integer reps
    ) {
    }

    public record WorkoutSessionResponse(
        Long id,
        String workoutDate,
        String memo,
        List<WorkoutRecordResponse> records
    ) {
        public static WorkoutSessionResponse from(WorkoutSession session) {
            return new WorkoutSessionResponse(
                session.getId(),
                session.getWorkoutDate().toString(),
                session.getMemo(),
                session.getRecords().stream()
                    .sorted(Comparator.comparing(WorkoutRecord::getId))
                    .map(WorkoutRecordResponse::from)
                    .toList()
            );
        }
    }

    public record WorkoutRecordResponse(
        Long id,
        Long machineId,
        String machineName,
        String muscleGroupLabel,
        String note,
        List<WorkoutSetResponse> sets
    ) {
        static WorkoutRecordResponse from(WorkoutRecord record) {
            return new WorkoutRecordResponse(
                record.getId(),
                record.getMachine().getId(),
                record.getMachine().getName(),
                record.getMachine().getMuscleGroup().getLabel(),
                record.getNote(),
                record.getSets().stream()
                    .sorted(Comparator.comparing(WorkoutSet::getSetOrder))
                    .map(WorkoutSetResponse::from)
                    .toList()
            );
        }
    }

    public record WorkoutSetResponse(Integer setOrder, String weightKg, Integer reps) {
        static WorkoutSetResponse from(WorkoutSet set) {
            return new WorkoutSetResponse(
                set.getSetOrder(),
                set.getWeightKg().stripTrailingZeros().toPlainString(),
                set.getReps()
            );
        }
    }
}

