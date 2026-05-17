package com.healthtracker.api.machine;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ExerciseMachine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MuscleGroup muscleGroup;

    @Column(nullable = false)
    private String movementPattern;

    private String description;

    protected ExerciseMachine() {
    }

    public ExerciseMachine(String name, MuscleGroup muscleGroup, String movementPattern, String description) {
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.movementPattern = movementPattern;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public String getMovementPattern() {
        return movementPattern;
    }

    public String getDescription() {
        return description;
    }
}

