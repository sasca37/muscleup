package com.healthtracker.api.workout.service;

import com.healthtracker.api.exercise.domain.Exercise;
import com.healthtracker.api.exercise.repository.ExerciseRepository;
import com.healthtracker.api.user.repository.UserAccountRepository;
import com.healthtracker.api.workout.domain.WorkoutRecord;
import com.healthtracker.api.workout.domain.WorkoutSession;
import com.healthtracker.api.workout.domain.WorkoutSessionStatus;
import com.healthtracker.api.workout.domain.WorkoutSet;
import com.healthtracker.api.workout.repository.WorkoutSessionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkoutSessionService {

    private static final int DEFAULT_HISTORY_LIMIT = 30;
    private static final int DEFAULT_EXERCISE_HISTORY_LIMIT = 10;

    private final WorkoutSessionRepository workoutSessionRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserAccountRepository userAccountRepository;

    public WorkoutSessionService(
        WorkoutSessionRepository workoutSessionRepository,
        ExerciseRepository exerciseRepository,
        UserAccountRepository userAccountRepository
    ) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.exerciseRepository = exerciseRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public WorkoutSession startSession(String userId, String workoutDate, String memo) {
        validateUser(userId);
        String targetDate = normalizeWorkoutDate(workoutDate);

        return workoutSessionRepository
            .findFirstByUserIdAndWorkoutDateAndStatusOrderByStartedAtDesc(
                userId,
                targetDate,
                WorkoutSessionStatus.IN_PROGRESS
            )
            .orElseGet(() -> workoutSessionRepository.save(
                WorkoutSession.start(userId, targetDate, normalizeNullableText(memo, 100))
            ));
    }

    public List<WorkoutSession> findTodaySessions(String userId, String date) {
        validateUser(userId);
        String targetDate = normalizeWorkoutDate(date);
        return workoutSessionRepository.findByUserIdAndWorkoutDateOrderByStartedAtDesc(userId, targetDate);
    }

    public List<WorkoutSession> findSessions(String userId, Integer limit) {
        validateUser(userId);
        int normalizedLimit = normalizeLimit(limit, DEFAULT_HISTORY_LIMIT, 100);
        return workoutSessionRepository.findByUserIdOrderByStartedAtDesc(userId, PageRequest.of(0, normalizedLimit));
    }

    public List<WorkoutSession> findExerciseHistory(String userId, int catalogId, Integer limit) {
        validateUser(userId);
        int normalizedLimit = normalizeLimit(limit, DEFAULT_EXERCISE_HISTORY_LIMIT, 30);
        return workoutSessionRepository.findByUserIdAndRecordsCatalogIdOrderByWorkoutDateDesc(
            userId,
            catalogId,
            PageRequest.of(0, normalizedLimit)
        );
    }

    public WorkoutSession addRecord(
        String userId,
        String sessionId,
        Integer catalogId,
        String note,
        List<WorkoutSetInput> setInputs
    ) {
        validateUser(userId);

        if (catalogId == null) {
            throw new InvalidWorkoutSessionRequestException("운동 종목을 선택해주세요.");
        }

        Exercise exercise = exerciseRepository.findByCatalogIdAndActiveTrue(catalogId)
            .orElseThrow(() -> new InvalidWorkoutSessionRequestException("운동 종목을 찾을 수 없습니다."));
        if (!exercise.isVisibleTo(userId)) {
            throw new InvalidWorkoutSessionRequestException("운동 종목을 찾을 수 없습니다.");
        }
        WorkoutSession session = findSessionForUser(sessionId, userId);
        List<WorkoutSet> sets = createSets(setInputs);

        session.addRecord(WorkoutRecord.from(exercise, normalizeNullableText(note, 200), sets));
        return workoutSessionRepository.save(session);
    }

    public WorkoutSession finishSession(String userId, String sessionId) {
        validateUser(userId);

        WorkoutSession session = findSessionForUser(sessionId, userId);
        if (session.getRecords().isEmpty()) {
            throw new InvalidWorkoutSessionRequestException("운동을 1개 이상 추가한 뒤 종료할 수 있습니다.");
        }

        session.finish();
        return workoutSessionRepository.save(session);
    }

    public WorkoutSession deleteRecord(String userId, String sessionId, String recordId) {
        validateUser(userId);

        if (recordId == null || recordId.isBlank()) {
            throw new InvalidWorkoutSessionRequestException("운동 기록 ID는 필수입니다.");
        }

        WorkoutSession session = findSessionForUser(sessionId, userId);
        if (!session.removeRecord(recordId)) {
            throw new InvalidWorkoutSessionRequestException("운동 기록을 찾을 수 없습니다.");
        }

        return workoutSessionRepository.save(session);
    }

    public void deleteSession(String userId, String sessionId) {
        validateUser(userId);

        WorkoutSession session = findSessionForUser(sessionId, userId);
        workoutSessionRepository.delete(session);
    }

    private WorkoutSession findSessionForUser(String sessionId, String userId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new InvalidWorkoutSessionRequestException("운동 세션 ID는 필수입니다.");
        }

        return workoutSessionRepository.findByIdAndUserId(sessionId, userId)
            .orElseThrow(WorkoutSessionNotFoundException::new);
    }

    private void validateUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidWorkoutSessionRequestException("사용자 ID는 필수입니다.");
        }

        if (!userAccountRepository.existsById(userId)) {
            throw new InvalidWorkoutSessionRequestException("사용자를 찾을 수 없습니다.");
        }
    }

    private List<WorkoutSet> createSets(List<WorkoutSetInput> setInputs) {
        if (setInputs == null || setInputs.isEmpty()) {
            throw new InvalidWorkoutSessionRequestException("최소 1개 이상의 세트를 입력해주세요.");
        }

        List<WorkoutSet> sets = new ArrayList<>();
        for (int index = 0; index < setInputs.size(); index++) {
            WorkoutSetInput input = setInputs.get(index);
            if (input.weightKg() == null || input.weightKg().compareTo(BigDecimal.ZERO) < 0) {
                throw new InvalidWorkoutSessionRequestException("중량은 0kg 이상으로 입력해주세요.");
            }

            if (input.reps() == null || input.reps() < 1) {
                throw new InvalidWorkoutSessionRequestException("반복 횟수는 1회 이상으로 입력해주세요.");
            }

            int setOrder = input.setOrder() == null || input.setOrder() < 1 ? index + 1 : input.setOrder();
            sets.add(WorkoutSet.of(setOrder, input.weightKg(), input.reps(), input.completed()));
        }

        return sets;
    }

    private String normalizeNullableText(String rawText, int maxLength) {
        if (rawText == null || rawText.isBlank()) {
            return null;
        }

        String text = rawText.trim();
        if (text.length() > maxLength) {
            throw new InvalidWorkoutSessionRequestException(maxLength + "자 이하로 입력해주세요.");
        }

        return text;
    }

    private String normalizeWorkoutDate(String rawWorkoutDate) {
        if (rawWorkoutDate == null || rawWorkoutDate.isBlank()) {
            return LocalDate.now().toString();
        }

        String workoutDate = rawWorkoutDate.trim();
        try {
            return LocalDate.parse(workoutDate).toString();
        } catch (DateTimeParseException exception) {
            throw new InvalidWorkoutSessionRequestException("운동일은 yyyy-MM-dd 형식으로 입력해주세요.");
        }
    }

    private int normalizeLimit(Integer limit, int defaultLimit, int maxLimit) {
        if (limit == null) {
            return defaultLimit;
        }

        if (limit < 1 || limit > maxLimit) {
            throw new InvalidWorkoutSessionRequestException("조회 개수는 1~" + maxLimit + " 사이로 입력해주세요.");
        }

        return limit;
    }

    public record WorkoutSetInput(
        Integer setOrder,
        BigDecimal weightKg,
        Integer reps,
        boolean completed
    ) {
    }
}
