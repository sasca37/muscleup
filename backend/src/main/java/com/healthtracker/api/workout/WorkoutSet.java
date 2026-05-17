package com.healthtracker.api.workout;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;

@Entity
public class WorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private WorkoutRecord record;

    @Column(nullable = false)
    private Integer setOrder;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal weightKg;

    @Column(nullable = false)
    private Integer reps;

    protected WorkoutSet() {
    }

    public WorkoutSet(Integer setOrder, BigDecimal weightKg, Integer reps) {
        this.setOrder = setOrder;
        this.weightKg = weightKg;
        this.reps = reps;
    }

    void setRecord(WorkoutRecord record) {
        this.record = record;
    }

    public Long getId() {
        return id;
    }

    public WorkoutRecord getRecord() {
        return record;
    }

    public Integer getSetOrder() {
        return setOrder;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public Integer getReps() {
        return reps;
    }
}

