package com.healthtracker.api.exercise.service;

import com.healthtracker.api.exercise.domain.Exercise;
import com.healthtracker.api.exercise.domain.MuscleGroup;
import com.healthtracker.api.exercise.repository.ExerciseRepository;
import com.healthtracker.api.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class ExerciseCatalogService {

    private final ExerciseRepository exerciseRepository;
    private final UserAccountRepository userAccountRepository;

    public ExerciseCatalogService(
        ExerciseRepository exerciseRepository,
        UserAccountRepository userAccountRepository
    ) {
        this.exerciseRepository = exerciseRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public List<Exercise> findExercises(String userId, String rawMuscleGroup) {
        if (rawMuscleGroup == null || rawMuscleGroup.isBlank()) {
            return exerciseRepository.findByActiveTrueOrderByCatalogIdAsc().stream()
                .filter((exercise) -> exercise.isVisibleTo(userId))
                .toList();
        }

        MuscleGroup muscleGroup = parseMuscleGroup(rawMuscleGroup);
        return exerciseRepository.findByMuscleGroupAndActiveTrueOrderByCatalogIdAsc(muscleGroup).stream()
            .filter((exercise) -> exercise.isVisibleTo(userId))
            .toList();
    }

    public Exercise createCustomExercise(
        String userId,
        String name,
        MuscleGroup muscleGroup,
        String movementPattern,
        String description
    ) {
        validateUser(userId);

        String normalizedName = normalizeRequiredText(name, 50, "운동 이름을 입력해주세요.");
        String normalizedMovementPattern = normalizeNullableText(movementPattern, 30);
        String normalizedDescription = normalizeNullableText(description, 120);
        int nextCatalogId = nextCatalogId();

        return exerciseRepository.save(Exercise.custom(
            nextCatalogId,
            userId,
            normalizedName,
            muscleGroup,
            normalizedMovementPattern == null ? "Custom" : normalizedMovementPattern,
            normalizedDescription
        ));
    }

    public void deleteCustomExercise(String userId, int catalogId) {
        validateUser(userId);

        Exercise exercise = exerciseRepository.findByCatalogIdAndActiveTrue(catalogId)
            .orElseThrow(() -> new InvalidExerciseRequestException("운동 종목을 찾을 수 없습니다."));

        if (!exercise.isOwnedBy(userId)) {
            throw new InvalidExerciseRequestException("직접 등록한 운동만 삭제할 수 있습니다.");
        }

        exercise.deactivate();
        exerciseRepository.save(exercise);
    }

    private MuscleGroup parseMuscleGroup(String rawMuscleGroup) {
        try {
            return MuscleGroup.valueOf(rawMuscleGroup.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new InvalidExerciseRequestException("지원하지 않는 운동 부위입니다.");
        }
    }

    private void validateUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidExerciseRequestException("사용자 ID는 필수입니다.");
        }

        if (!userAccountRepository.existsById(userId)) {
            throw new InvalidExerciseRequestException("사용자를 찾을 수 없습니다.");
        }
    }

    private int nextCatalogId() {
        return exerciseRepository.findFirstByOrderByCatalogIdDesc()
            .map((exercise) -> exercise.getCatalogId() + 1)
            .orElse(1);
    }

    private String normalizeRequiredText(String rawText, int maxLength, String blankMessage) {
        if (rawText == null || rawText.isBlank()) {
            throw new InvalidExerciseRequestException(blankMessage);
        }

        String text = rawText.trim();
        if (text.length() > maxLength) {
            throw new InvalidExerciseRequestException(maxLength + "자 이하로 입력해주세요.");
        }

        return text;
    }

    private String normalizeNullableText(String rawText, int maxLength) {
        if (rawText == null || rawText.isBlank()) {
            return null;
        }

        String text = rawText.trim();
        if (text.length() > maxLength) {
            throw new InvalidExerciseRequestException(maxLength + "자 이하로 입력해주세요.");
        }

        return text;
    }
}
