package com.healthtracker.api.exercise.config;

import com.healthtracker.api.exercise.domain.Exercise;
import com.healthtracker.api.exercise.domain.MuscleGroup;
import com.healthtracker.api.exercise.repository.ExerciseRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExerciseCatalogSeeder implements ApplicationRunner {

    private final ExerciseRepository exerciseRepository;

    public ExerciseCatalogSeeder(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (exerciseRepository.count() > 0) {
            return;
        }

        exerciseRepository.saveAll(defaultExercises());
    }

    private List<Exercise> defaultExercises() {
        return List.of(
            exercise(1, "체스트 프레스", MuscleGroup.CHEST, "Push", "가슴 전면을 안정적으로 밀어내는 머신"),
            exercise(2, "펙덱 플라이", MuscleGroup.CHEST, "Fly", "가슴 수축 감각을 기록하기 좋은 머신"),
            exercise(3, "인클라인 체스트 프레스", MuscleGroup.CHEST, "Incline Push", "윗가슴과 전면 어깨를 함께 쓰는 프레스"),
            exercise(4, "디클라인 체스트 프레스", MuscleGroup.CHEST, "Decline Push", "아랫가슴을 안정적으로 자극하는 머신"),
            exercise(5, "케이블 크로스오버", MuscleGroup.CHEST, "Cable Fly", "가슴 중앙 수축과 궤적 조절에 좋은 운동"),
            exercise(6, "스미스 벤치프레스", MuscleGroup.CHEST, "Bar Path Push", "고정 궤도로 중량을 밀어내는 프레스"),
            exercise(7, "덤벨 벤치프레스", MuscleGroup.CHEST, "Free Push", "가동범위와 좌우 밸런스를 함께 기록하기 좋은 운동"),
            exercise(8, "푸쉬업", MuscleGroup.CHEST, "Bodyweight Push", "체중 기반으로 가슴과 코어를 함께 쓰는 운동"),
            exercise(9, "머신 딥스", MuscleGroup.CHEST, "Dip", "가슴 하부와 삼두를 함께 강화하는 머신"),
            exercise(10, "체스트 플라이 머신", MuscleGroup.CHEST, "Isolation Fly", "팔꿈치 각도를 고정하고 가슴 수축에 집중하는 운동"),

            exercise(11, "랫풀다운", MuscleGroup.BACK, "Pull", "광배근 중심의 수직 당기기 운동"),
            exercise(12, "시티드 로우", MuscleGroup.BACK, "Pull", "등 중앙부와 후면 체인을 쓰는 머신"),
            exercise(13, "어시스트 풀업", MuscleGroup.BACK, "Vertical Pull", "풀업 패턴을 보조 중량으로 연습하는 운동"),
            exercise(14, "티바 로우", MuscleGroup.BACK, "Row", "등 두께와 견갑 후인을 함께 기록하기 좋은 운동"),
            exercise(15, "원암 덤벨 로우", MuscleGroup.BACK, "Single Row", "좌우 광배근 사용감을 따로 확인하는 로우"),
            exercise(16, "케이블 스트레이트 암 풀다운", MuscleGroup.BACK, "Pullover", "팔을 편 상태로 광배 수축에 집중하는 운동"),
            exercise(17, "백 익스텐션", MuscleGroup.BACK, "Extension", "척추기립근과 후면 체인을 강화하는 운동"),
            exercise(18, "하이 로우 머신", MuscleGroup.BACK, "High Row", "상부 등과 광배를 대각선 궤도로 당기는 머신"),
            exercise(19, "덤벨 풀오버", MuscleGroup.BACK, "Pullover", "광배와 흉곽 확장 감각을 기록하기 좋은 운동"),
            exercise(20, "리버스 그립 랫풀다운", MuscleGroup.BACK, "Underhand Pull", "하부 광배와 팔꿈치 당김 경로를 강조하는 운동"),

            exercise(21, "레그 프레스", MuscleGroup.LEGS, "Push", "고중량 하체 기록에 적합한 머신"),
            exercise(22, "레그 컬", MuscleGroup.LEGS, "Curl", "햄스트링 고립 운동"),
            exercise(23, "레그 익스텐션", MuscleGroup.LEGS, "Extension", "대퇴사두근 수축을 명확히 확인하는 머신"),
            exercise(24, "스쿼트", MuscleGroup.LEGS, "Squat", "하체 전반과 코어 안정성을 함께 쓰는 대표 운동"),
            exercise(25, "핵 스쿼트", MuscleGroup.LEGS, "Machine Squat", "고정 궤도로 대퇴사두근에 집중하는 운동"),
            exercise(26, "루마니안 데드리프트", MuscleGroup.LEGS, "Hinge", "햄스트링과 둔근의 후면 체인을 강화하는 운동"),
            exercise(27, "힙 쓰러스트", MuscleGroup.LEGS, "Hip Drive", "둔근 수축과 고관절 신전을 기록하기 좋은 운동"),
            exercise(28, "스미스 런지", MuscleGroup.LEGS, "Lunge", "한쪽 다리씩 안정적으로 부하를 주는 운동"),
            exercise(29, "스탠딩 카프 레이즈", MuscleGroup.LEGS, "Calf Raise", "종아리 근육을 반복 수축하는 운동"),
            exercise(30, "힙 어브덕션", MuscleGroup.LEGS, "Abduction", "중둔근과 고관절 외전을 강화하는 머신"),

            exercise(31, "숄더 프레스", MuscleGroup.SHOULDERS, "Push", "어깨 전면과 측면을 쓰는 머신"),
            exercise(32, "레터럴 레이즈 머신", MuscleGroup.SHOULDERS, "Raise", "측면 삼각근 고립 운동"),
            exercise(33, "덤벨 숄더 프레스", MuscleGroup.SHOULDERS, "Free Push", "좌우 어깨 안정성과 프레스 힘을 함께 기록하는 운동"),
            exercise(34, "오버헤드프레스", MuscleGroup.SHOULDERS, "Vertical Press", "전신 긴장과 수직 밀기를 함께 요구하는 운동"),
            exercise(35, "케이블 레터럴 레이즈", MuscleGroup.SHOULDERS, "Cable Raise", "저항이 일정한 측면 삼각근 고립 운동"),
            exercise(36, "리어 델트 플라이", MuscleGroup.SHOULDERS, "Rear Fly", "후면 삼각근과 견갑 안정성을 강화하는 운동"),
            exercise(37, "페이스 풀", MuscleGroup.SHOULDERS, "Pull Apart", "후면 어깨와 회전근개 컨디셔닝에 좋은 운동"),
            exercise(38, "업라이트 로우", MuscleGroup.SHOULDERS, "Upright Pull", "측면 어깨와 승모 상부를 함께 쓰는 운동"),
            exercise(39, "프론트 레이즈", MuscleGroup.SHOULDERS, "Front Raise", "전면 삼각근 고립 자극을 기록하는 운동"),
            exercise(40, "머신 숄더 레이즈", MuscleGroup.SHOULDERS, "Machine Raise", "고정 궤도로 측면 어깨를 반복 자극하는 머신"),

            exercise(41, "케이블 푸시다운", MuscleGroup.ARMS, "Extension", "삼두 운동 기록에 적합"),
            exercise(42, "암 컬 머신", MuscleGroup.ARMS, "Curl", "이두 고립 운동"),
            exercise(43, "덤벨 컬", MuscleGroup.ARMS, "Curl", "좌우 이두근 수행량을 따로 확인하기 좋은 운동"),
            exercise(44, "해머 컬", MuscleGroup.ARMS, "Neutral Curl", "상완근과 전완까지 함께 쓰는 컬"),
            exercise(45, "프리처 컬", MuscleGroup.ARMS, "Supported Curl", "반동을 줄이고 이두 수축에 집중하는 운동"),
            exercise(46, "스컬 크러셔", MuscleGroup.ARMS, "Elbow Extension", "삼두 장두 자극을 기록하기 좋은 운동"),
            exercise(47, "오버헤드 트라이셉스 익스텐션", MuscleGroup.ARMS, "Overhead Extension", "팔을 머리 위로 올려 삼두 장두를 늘리는 운동"),
            exercise(48, "딥스", MuscleGroup.ARMS, "Dip", "삼두와 가슴 하부를 함께 쓰는 체중 운동"),
            exercise(49, "케이블 로프 컬", MuscleGroup.ARMS, "Cable Curl", "케이블 저항으로 이두 수축감을 유지하는 운동"),
            exercise(50, "리버스 컬", MuscleGroup.ARMS, "Reverse Curl", "전완과 상완근을 함께 강화하는 운동"),

            exercise(51, "어브도미널 크런치", MuscleGroup.CORE, "Crunch", "복직근 수축 기록용 머신"),
            exercise(52, "로터리 토르소", MuscleGroup.CORE, "Rotation", "코어 회전 운동"),
            exercise(53, "플랭크", MuscleGroup.CORE, "Anti Extension", "복압과 몸통 안정성을 유지하는 체중 운동"),
            exercise(54, "행잉 레그레이즈", MuscleGroup.CORE, "Leg Raise", "하복부와 골반 컨트롤을 함께 쓰는 운동"),
            exercise(55, "케이블 크런치", MuscleGroup.CORE, "Cable Crunch", "부하를 조절하며 복직근을 수축하는 운동"),
            exercise(56, "데드버그", MuscleGroup.CORE, "Anti Extension", "허리 안정성과 팔다리 협응을 연습하는 운동"),
            exercise(57, "팔로프 프레스", MuscleGroup.CORE, "Anti Rotation", "회전 저항을 버티며 몸통 안정성을 키우는 운동"),
            exercise(58, "사이드 플랭크", MuscleGroup.CORE, "Lateral Stability", "측면 코어와 골반 안정성을 강화하는 운동"),
            exercise(59, "앱 휠 롤아웃", MuscleGroup.CORE, "Rollout", "복압 유지와 전면 코어 힘을 요구하는 운동"),
            exercise(60, "마운틴 클라이머", MuscleGroup.CORE, "Dynamic Core", "코어 안정성과 심박을 함께 올리는 운동")
        );
    }

    private Exercise exercise(
        int catalogId,
        String name,
        MuscleGroup muscleGroup,
        String movementPattern,
        String description
    ) {
        return Exercise.seed(catalogId, name, muscleGroup, movementPattern, description);
    }
}
