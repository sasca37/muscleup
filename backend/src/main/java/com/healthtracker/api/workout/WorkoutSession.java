package com.healthtracker.api.workout;

import com.healthtracker.api.auth.UserAccount;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private UserAccount user;

    @Column(nullable = false)
    private LocalDate workoutDate;

    private String memo;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutRecord> records = new ArrayList<>();

    protected WorkoutSession() {
    }

    public WorkoutSession(UserAccount user, LocalDate workoutDate, String memo) {
        this.user = user;
        this.workoutDate = workoutDate;
        this.memo = memo;
    }

    public void addRecord(WorkoutRecord record) {
        records.add(record);
        record.setSession(this);
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public LocalDate getWorkoutDate() {
        return workoutDate;
    }

    public String getMemo() {
        return memo;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<WorkoutRecord> getRecords() {
        return records;
    }
}

