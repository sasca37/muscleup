package com.healthtracker.api.machine;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseMachineRepository extends JpaRepository<ExerciseMachine, Long> {
    List<ExerciseMachine> findByMuscleGroupOrderByName(MuscleGroup muscleGroup);
}

