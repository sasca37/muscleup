package com.healthtracker.api.machine;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MachineDataInitializer implements ApplicationRunner {

    private final ExerciseMachineRepository repository;

    public MachineDataInitializer(ExerciseMachineRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }

        repository.saveAll(List.of(
            new ExerciseMachine("체스트 프레스", MuscleGroup.CHEST, "Push", "가슴 전면을 안정적으로 밀어내는 머신"),
            new ExerciseMachine("펙덱 플라이", MuscleGroup.CHEST, "Fly", "가슴 수축 감각을 기록하기 좋은 머신"),
            new ExerciseMachine("랫풀다운", MuscleGroup.BACK, "Pull", "광배근 중심의 수직 당기기 운동"),
            new ExerciseMachine("시티드 로우", MuscleGroup.BACK, "Pull", "등 중앙부와 후면 체인을 쓰는 머신"),
            new ExerciseMachine("레그 프레스", MuscleGroup.LEGS, "Push", "고중량 하체 기록에 적합한 머신"),
            new ExerciseMachine("레그 컬", MuscleGroup.LEGS, "Curl", "햄스트링 고립 운동"),
            new ExerciseMachine("숄더 프레스", MuscleGroup.SHOULDERS, "Push", "어깨 전면과 측면을 쓰는 머신"),
            new ExerciseMachine("레터럴 레이즈 머신", MuscleGroup.SHOULDERS, "Raise", "측면 삼각근 고립 운동"),
            new ExerciseMachine("케이블 푸시다운", MuscleGroup.ARMS, "Extension", "삼두 운동 기록에 적합"),
            new ExerciseMachine("암 컬 머신", MuscleGroup.ARMS, "Curl", "이두 고립 운동"),
            new ExerciseMachine("어브도미널 크런치", MuscleGroup.CORE, "Crunch", "복직근 수축 기록용 머신"),
            new ExerciseMachine("로터리 토르소", MuscleGroup.CORE, "Rotation", "코어 회전 운동")
        ));
    }
}

