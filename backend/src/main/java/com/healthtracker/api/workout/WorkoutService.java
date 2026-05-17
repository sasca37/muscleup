package com.healthtracker.api.workout;

import com.healthtracker.api.auth.UserAccount;
import com.healthtracker.api.machine.ExerciseMachine;
import com.healthtracker.api.machine.ExerciseMachineRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkoutService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final ExerciseMachineRepository exerciseMachineRepository;

    public WorkoutService(
        WorkoutSessionRepository workoutSessionRepository,
        ExerciseMachineRepository exerciseMachineRepository
    ) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.exerciseMachineRepository = exerciseMachineRepository;
    }

    @Transactional
    public WorkoutDtos.WorkoutSessionResponse create(UserAccount user, WorkoutDtos.CreateWorkoutSessionRequest request) {
        WorkoutSession session = new WorkoutSession(user, request.workoutDate(), request.memo());

        for (WorkoutDtos.CreateWorkoutRecordRequest recordRequest : request.records()) {
            ExerciseMachine machine = exerciseMachineRepository.findById(recordRequest.machineId())
                .orElseThrow(() -> new EntityNotFoundException("Exercise machine not found: " + recordRequest.machineId()));

            WorkoutRecord record = new WorkoutRecord(machine, recordRequest.note());
            int order = 1;
            for (WorkoutDtos.CreateWorkoutSetRequest setRequest : recordRequest.sets()) {
                record.addSet(new WorkoutSet(order++, setRequest.weightKg(), setRequest.reps()));
            }
            session.addRecord(record);
        }

        return WorkoutDtos.WorkoutSessionResponse.from(workoutSessionRepository.save(session));
    }
}

