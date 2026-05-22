package com.healthtracker.api.exercise.repository;

import com.healthtracker.api.exercise.domain.Exercise;
import com.healthtracker.api.exercise.domain.MuscleGroup;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends MongoRepository<Exercise, String> {

    List<Exercise> findByActiveTrueOrderByCatalogIdAsc();

    List<Exercise> findByMuscleGroupAndActiveTrueOrderByCatalogIdAsc(MuscleGroup muscleGroup);

    Optional<Exercise> findByCatalogIdAndActiveTrue(int catalogId);
}
