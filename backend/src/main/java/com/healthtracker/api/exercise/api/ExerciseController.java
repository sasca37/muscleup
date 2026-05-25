package com.healthtracker.api.exercise.api;

import com.healthtracker.api.exercise.service.ExerciseCatalogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private static final String USER_ID_HEADER = "X-User-Id";

    private final ExerciseCatalogService exerciseCatalogService;

    public ExerciseController(ExerciseCatalogService exerciseCatalogService) {
        this.exerciseCatalogService = exerciseCatalogService;
    }

    @GetMapping
    public List<ExerciseDtos.ExerciseResponse> listExercises(
        @RequestHeader(value = USER_ID_HEADER, required = false) String userId,
        @RequestParam(required = false) String muscleGroup
    ) {
        return exerciseCatalogService.findExercises(userId, muscleGroup).stream()
            .map(ExerciseDtos.ExerciseResponse::from)
            .toList();
    }

    @PostMapping("/custom")
    public ExerciseDtos.ExerciseResponse createCustomExercise(
        @RequestHeader(USER_ID_HEADER) String userId,
        @Valid @RequestBody ExerciseDtos.CreateCustomExerciseRequest request
    ) {
        return ExerciseDtos.ExerciseResponse.from(exerciseCatalogService.createCustomExercise(
            userId,
            request.name(),
            request.muscleGroup(),
            request.movementPattern(),
            request.description()
        ));
    }

    @DeleteMapping("/{catalogId}")
    public void deleteCustomExercise(
        @RequestHeader(USER_ID_HEADER) String userId,
        @PathVariable int catalogId
    ) {
        exerciseCatalogService.deleteCustomExercise(userId, catalogId);
    }
}
