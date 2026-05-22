package com.healthtracker.api.workout.repository;

import com.healthtracker.api.workout.domain.WorkoutSession;
import com.healthtracker.api.workout.domain.WorkoutSessionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutSessionRepository extends MongoRepository<WorkoutSession, String> {

    Optional<WorkoutSession> findByIdAndUserId(String id, String userId);

    Optional<WorkoutSession> findFirstByUserIdAndWorkoutDateAndStatusOrderByStartedAtDesc(
        String userId,
        String workoutDate,
        WorkoutSessionStatus status
    );

    List<WorkoutSession> findByUserIdAndWorkoutDateOrderByStartedAtDesc(String userId, String workoutDate);

    List<WorkoutSession> findByUserIdOrderByStartedAtDesc(String userId, Pageable pageable);

    List<WorkoutSession> findByUserIdAndRecordsCatalogIdOrderByWorkoutDateDesc(
        String userId,
        int catalogId,
        Pageable pageable
    );
}
