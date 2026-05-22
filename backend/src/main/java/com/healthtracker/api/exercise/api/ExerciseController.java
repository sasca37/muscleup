package com.healthtracker.api.exercise.api;

import com.healthtracker.api.exercise.service.ExerciseCatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseCatalogService exerciseCatalogService;

    public ExerciseController(ExerciseCatalogService exerciseCatalogService) {
        this.exerciseCatalogService = exerciseCatalogService;
    }

    @GetMapping
    public List<ExerciseDtos.ExerciseResponse> listExercises(
        @RequestParam(required = false) String muscleGroup
    ) {
        return exerciseCatalogService.findExercises(muscleGroup).stream()
            .map(ExerciseDtos.ExerciseResponse::from)
            .toList();
    }
}
