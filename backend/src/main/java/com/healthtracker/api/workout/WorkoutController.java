package com.healthtracker.api.workout;

import com.healthtracker.api.auth.CurrentUserService;
import com.healthtracker.api.auth.UserAccount;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;
    private final WorkoutQueryService workoutQueryService;
    private final CurrentUserService currentUserService;

    public WorkoutController(
        WorkoutService workoutService,
        WorkoutQueryService workoutQueryService,
        CurrentUserService currentUserService
    ) {
        this.workoutService = workoutService;
        this.workoutQueryService = workoutQueryService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<WorkoutDtos.WorkoutSessionResponse> workouts(
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        OAuth2AuthenticationToken authentication
    ) {
        UserAccount user = currentUserService.resolve(authentication);
        LocalDate end = to == null ? LocalDate.now() : to;
        LocalDate start = from == null ? end.minusDays(30) : from;
        return workoutQueryService.findSessions(user, start, end);
    }

    @PostMapping
    public WorkoutDtos.WorkoutSessionResponse create(
        @Valid @RequestBody WorkoutDtos.CreateWorkoutSessionRequest request,
        OAuth2AuthenticationToken authentication
    ) {
        UserAccount user = currentUserService.resolve(authentication);
        return workoutService.create(user, request);
    }
}

