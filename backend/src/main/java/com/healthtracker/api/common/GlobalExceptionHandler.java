package com.healthtracker.api.common;

import com.healthtracker.api.exercise.service.InvalidExerciseRequestException;
import com.healthtracker.api.user.service.DuplicateUserException;
import com.healthtracker.api.user.service.InvalidCredentialsException;
import com.healthtracker.api.user.service.InvalidUserRequestException;
import com.healthtracker.api.workout.service.InvalidWorkoutSessionRequestException;
import com.healthtracker.api.workout.service.WorkoutSessionNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidUserRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidUserRequest(InvalidUserRequestException exception) {
        return ResponseEntity.badRequest()
            .body(ApiErrorResponse.of("INVALID_USER_REQUEST", exception.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(InvalidCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiErrorResponse.of("INVALID_CREDENTIALS", exception.getMessage()));
    }

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateUser(DuplicateUserException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiErrorResponse.of("DUPLICATE_USER", exception.getMessage()));
    }

    @ExceptionHandler(InvalidExerciseRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidExerciseRequest(InvalidExerciseRequestException exception) {
        return ResponseEntity.badRequest()
            .body(ApiErrorResponse.of("INVALID_EXERCISE_REQUEST", exception.getMessage()));
    }

    @ExceptionHandler(InvalidWorkoutSessionRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidWorkoutSessionRequest(
        InvalidWorkoutSessionRequestException exception
    ) {
        return ResponseEntity.badRequest()
            .body(ApiErrorResponse.of("INVALID_WORKOUT_SESSION_REQUEST", exception.getMessage()));
    }

    @ExceptionHandler(WorkoutSessionNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleWorkoutSessionNotFound(WorkoutSessionNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiErrorResponse.of("WORKOUT_SESSION_NOT_FOUND", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        return ResponseEntity.badRequest()
            .body(ApiErrorResponse.of("VALIDATION_FAILED", "요청 값을 확인해주세요."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidJson(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest()
            .body(ApiErrorResponse.of("INVALID_REQUEST_BODY", "요청 본문을 확인해주세요."));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException exception) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
            .body(ApiErrorResponse.of("UNSUPPORTED_MEDIA_TYPE", "지원하지 않는 Content-Type입니다."));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingRequestHeader(MissingRequestHeaderException exception) {
        return ResponseEntity.badRequest()
            .body(ApiErrorResponse.of("MISSING_REQUEST_HEADER", exception.getHeaderName() + " 헤더는 필수입니다."));
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateKey(DuplicateKeyException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiErrorResponse.of("DUPLICATE_KEY", "이미 존재하는 데이터입니다."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
        log.error("Unexpected server error", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiErrorResponse.of("INTERNAL_SERVER_ERROR", "서버 처리 중 오류가 발생했습니다."));
    }
}
