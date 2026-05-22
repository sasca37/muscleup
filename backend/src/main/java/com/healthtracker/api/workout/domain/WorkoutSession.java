package com.healthtracker.api.workout.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document("workout_sessions")
@CompoundIndexes({
    @CompoundIndex(name = "user_date_idx", def = "{'userId': 1, 'workoutDate': -1}"),
    @CompoundIndex(name = "user_started_idx", def = "{'userId': 1, 'startedAt': -1}"),
    @CompoundIndex(name = "user_exercise_idx", def = "{'userId': 1, 'records.catalogId': 1, 'workoutDate': -1}")
})
public class WorkoutSession {

    @Id
    private String id;

    private String userId;

    private String workoutDate;

    private WorkoutSessionStatus status;

    private Instant startedAt;

    private Instant finishedAt;

    private Long durationSeconds;

    private String memo;

    private List<WorkoutRecord> records = new ArrayList<>();

    private Instant createdAt;

    private Instant updatedAt;

    protected WorkoutSession() {
    }

    private WorkoutSession(String userId, String workoutDate, String memo, Instant now) {
        this.userId = userId;
        this.workoutDate = workoutDate;
        this.status = WorkoutSessionStatus.IN_PROGRESS;
        this.startedAt = now;
        this.memo = memo;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public static WorkoutSession start(String userId, String workoutDate, String memo) {
        return new WorkoutSession(userId, workoutDate, memo, Instant.now());
    }

    public void addRecord(WorkoutRecord record) {
        this.records.add(record);
        this.updatedAt = Instant.now();
    }

    public void finish() {
        if (this.status == WorkoutSessionStatus.FINISHED) {
            return;
        }

        Instant now = Instant.now();
        this.status = WorkoutSessionStatus.FINISHED;
        this.finishedAt = now;
        this.durationSeconds = Math.max(1L, Duration.between(startedAt, now).getSeconds());
        this.updatedAt = now;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getWorkoutDate() {
        return workoutDate;
    }

    public WorkoutSessionStatus getStatus() {
        return status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public String getMemo() {
        return memo;
    }

    public List<WorkoutRecord> getRecords() {
        return records;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
