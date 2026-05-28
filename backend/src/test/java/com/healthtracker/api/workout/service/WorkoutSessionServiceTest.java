package com.healthtracker.api.workout.service;

import com.healthtracker.api.exercise.domain.Exercise;
import com.healthtracker.api.exercise.domain.MuscleGroup;
import com.healthtracker.api.exercise.repository.ExerciseRepository;
import com.healthtracker.api.user.repository.UserAccountRepository;
import com.healthtracker.api.workout.domain.WorkoutRecord;
import com.healthtracker.api.workout.domain.WorkoutSession;
import com.healthtracker.api.workout.domain.WorkoutSet;
import com.healthtracker.api.workout.repository.WorkoutSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkoutSessionServiceTest {

    @Mock
    private WorkoutSessionRepository workoutSessionRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @InjectMocks
    private WorkoutSessionService workoutSessionService;

    @Test
    void cannotAddRecordToFinishedSession() {
        String userId = "user-1";
        String sessionId = "session-1";
        int catalogId = 1;
        Exercise exercise = Exercise.seed(catalogId, "벤치프레스", MuscleGroup.CHEST, "Push", "가슴 운동");
        WorkoutSession session = WorkoutSession.start(userId, "2026-05-28", null);
        session.addRecord(WorkoutRecord.from(
            exercise,
            null,
            List.of(WorkoutSet.of(1, BigDecimal.valueOf(60), 10, true))
        ));
        session.finish();

        when(userAccountRepository.existsById(userId)).thenReturn(true);
        when(exerciseRepository.findByCatalogIdAndActiveTrue(catalogId)).thenReturn(Optional.of(exercise));
        when(workoutSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> workoutSessionService.addRecord(
            userId,
            sessionId,
            catalogId,
            null,
            List.of(new WorkoutSessionService.WorkoutSetInput(1, BigDecimal.valueOf(70), 8, true))
        ))
            .isInstanceOf(InvalidWorkoutSessionRequestException.class)
            .hasMessage("완료된 운동 세션에는 기록을 추가할 수 없습니다.");

        verify(workoutSessionRepository, never()).save(session);
    }
}
