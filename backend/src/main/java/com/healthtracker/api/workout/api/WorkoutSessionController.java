package com.healthtracker.api.workout.api;

import com.healthtracker.api.workout.service.WorkoutSessionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    private static final String USER_ID_HEADER = "X-User-Id";

    private final WorkoutSessionService workoutSessionService;

    public WorkoutSessionController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @PostMapping("/start")
    public WorkoutSessionDtos.WorkoutSessionResponse startSession(
        @RequestHeader(USER_ID_HEADER) String userId,
        @RequestBody(required = false) WorkoutSessionDtos.StartSessionRequest request
    ) {
        WorkoutSessionDtos.StartSessionRequest safeRequest =
            request == null ? new WorkoutSessionDtos.StartSessionRequest(null, null) : request;

        return WorkoutSessionDtos.WorkoutSessionResponse.from(
            workoutSessionService.startSession(userId, safeRequest.workoutDate(), safeRequest.memo())
        );
    }

    @GetMapping("/today")
    public List<WorkoutSessionDtos.WorkoutSessionResponse> findTodaySessions(
        @RequestHeader(USER_ID_HEADER) String userId,
        @RequestParam(required = false) String date
    ) {
        return workoutSessionService.findTodaySessions(userId, date).stream()
            .map(WorkoutSessionDtos.WorkoutSessionResponse::from)
            .toList();
    }

    @GetMapping
    public List<WorkoutSessionDtos.WorkoutSessionResponse> findSessions(
        @RequestHeader(USER_ID_HEADER) String userId,
        @RequestParam(required = false) Integer limit
    ) {
        return workoutSessionService.findSessions(userId, limit).stream()
            .map(WorkoutSessionDtos.WorkoutSessionResponse::from)
            .toList();
    }

    @PostMapping("/{sessionId}/records")
    public WorkoutSessionDtos.WorkoutSessionResponse addRecord(
        @RequestHeader(USER_ID_HEADER) String userId,
        @PathVariable String sessionId,
        @Valid @RequestBody WorkoutSessionDtos.AddRecordRequest request
    ) {
        return WorkoutSessionDtos.WorkoutSessionResponse.from(
            workoutSessionService.addRecord(
                userId,
                sessionId,
                request.catalogId(),
                request.note(),
                request.sets() == null
                    ? List.of()
                    : request.sets().stream()
                        .map(WorkoutSessionDtos.SetRequest::toInput)
                        .toList()
            )
        );
    }

    @PatchMapping("/{sessionId}/finish")
    public WorkoutSessionDtos.WorkoutSessionResponse finishSession(
        @RequestHeader(USER_ID_HEADER) String userId,
        @PathVariable String sessionId
    ) {
        return WorkoutSessionDtos.WorkoutSessionResponse.from(
            workoutSessionService.finishSession(userId, sessionId)
        );
    }
}
