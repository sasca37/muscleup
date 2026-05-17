package com.healthtracker.api.workout;

import com.healthtracker.api.auth.UserAccount;
import com.healthtracker.api.machine.MachineController.MachineHistoryResponse;
import com.healthtracker.api.machine.MachineController.SetResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class WorkoutQueryService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutRecordRepository workoutRecordRepository;

    public WorkoutQueryService(
        WorkoutSessionRepository workoutSessionRepository,
        WorkoutRecordRepository workoutRecordRepository
    ) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.workoutRecordRepository = workoutRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkoutDtos.WorkoutSessionResponse> findSessions(UserAccount user, LocalDate from, LocalDate to) {
        return workoutSessionRepository.findSessions(user, from, to)
            .stream()
            .map(WorkoutDtos.WorkoutSessionResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<MachineHistoryResponse> findMachineHistory(UserAccount user, Long machineId) {
        return workoutRecordRepository.findHistory(user, machineId)
            .stream()
            .limit(10)
            .map(record -> new MachineHistoryResponse(
                record.getSession().getId(),
                record.getId(),
                record.getSession().getWorkoutDate().toString(),
                record.getMachine().getName(),
                record.getSets().stream()
                    .sorted(Comparator.comparing(WorkoutSet::getSetOrder))
                    .map(set -> new SetResponse(
                        set.getSetOrder(),
                        set.getWeightKg().stripTrailingZeros().toPlainString(),
                        set.getReps()
                    ))
                    .toList(),
                record.getNote()
            ))
            .toList();
    }
}

