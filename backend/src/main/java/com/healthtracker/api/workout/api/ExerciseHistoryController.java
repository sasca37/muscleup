package com.healthtracker.api.workout.api;

import com.healthtracker.api.workout.service.WorkoutSessionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ExerciseHistoryController {

    private static final String USER_ID_HEADER = "X-User-Id";

    private final WorkoutSessionService workoutSessionService;

    public ExerciseHistoryController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @GetMapping("/api/exercises/{catalogId}/history")
    public List<WorkoutSessionDtos.WorkoutSessionResponse> findExerciseHistory(
        @RequestHeader(USER_ID_HEADER) String userId,
        @PathVariable int catalogId,
        @RequestParam(required = false) Integer limit
    ) {
        return workoutSessionService.findExerciseHistory(userId, catalogId, limit).stream()
            .map(WorkoutSessionDtos.WorkoutSessionResponse::from)
            .toList();
    }
}
