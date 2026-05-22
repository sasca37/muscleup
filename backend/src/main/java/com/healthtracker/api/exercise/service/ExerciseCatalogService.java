package com.healthtracker.api.exercise.service;

import com.healthtracker.api.exercise.domain.Exercise;
import com.healthtracker.api.exercise.domain.MuscleGroup;
import com.healthtracker.api.exercise.repository.ExerciseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class ExerciseCatalogService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseCatalogService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public List<Exercise> findExercises(String rawMuscleGroup) {
        if (rawMuscleGroup == null || rawMuscleGroup.isBlank()) {
            return exerciseRepository.findByActiveTrueOrderByCatalogIdAsc();
        }

        MuscleGroup muscleGroup = parseMuscleGroup(rawMuscleGroup);
        return exerciseRepository.findByMuscleGroupAndActiveTrueOrderByCatalogIdAsc(muscleGroup);
    }

    private MuscleGroup parseMuscleGroup(String rawMuscleGroup) {
        try {
            return MuscleGroup.valueOf(rawMuscleGroup.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new InvalidExerciseRequestException("지원하지 않는 운동 부위입니다.");
        }
    }
}
