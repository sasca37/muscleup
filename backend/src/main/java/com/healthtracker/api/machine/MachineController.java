package com.healthtracker.api.machine;

import com.healthtracker.api.auth.CurrentUserService;
import com.healthtracker.api.auth.UserAccount;
import com.healthtracker.api.workout.WorkoutQueryService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
public class MachineController {

    private final ExerciseMachineRepository exerciseMachineRepository;
    private final WorkoutQueryService workoutQueryService;
    private final CurrentUserService currentUserService;

    public MachineController(
        ExerciseMachineRepository exerciseMachineRepository,
        WorkoutQueryService workoutQueryService,
        CurrentUserService currentUserService
    ) {
        this.exerciseMachineRepository = exerciseMachineRepository;
        this.workoutQueryService = workoutQueryService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<MachineResponse> machines(@RequestParam(required = false) MuscleGroup muscleGroup) {
        List<ExerciseMachine> machines = muscleGroup == null
            ? exerciseMachineRepository.findAll()
            : exerciseMachineRepository.findByMuscleGroupOrderByName(muscleGroup);

        return machines.stream().map(MachineResponse::from).toList();
    }

    @GetMapping("/{machineId}/history")
    public List<MachineHistoryResponse> history(
        @PathVariable Long machineId,
        OAuth2AuthenticationToken authentication
    ) {
        UserAccount user = currentUserService.resolve(authentication);
        return workoutQueryService.findMachineHistory(user, machineId);
    }

    public record MachineResponse(
        Long id,
        String name,
        MuscleGroup muscleGroup,
        String muscleGroupLabel,
        String movementPattern,
        String description
    ) {
        static MachineResponse from(ExerciseMachine machine) {
            return new MachineResponse(
                machine.getId(),
                machine.getName(),
                machine.getMuscleGroup(),
                machine.getMuscleGroup().getLabel(),
                machine.getMovementPattern(),
                machine.getDescription()
            );
        }
    }

    public record MachineHistoryResponse(
        Long sessionId,
        Long recordId,
        String workoutDate,
        String machineName,
        List<SetResponse> sets,
        String note
    ) {
    }

    public record SetResponse(Integer setOrder, String weightKg, Integer reps) {
    }
}

