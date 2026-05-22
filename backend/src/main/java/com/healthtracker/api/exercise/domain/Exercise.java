package com.healthtracker.api.exercise.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("exercises")
public class Exercise {

    @Id
    private String id;

    @Indexed(unique = true)
    private int catalogId;

    private String name;

    @Indexed
    private MuscleGroup muscleGroup;

    private String muscleGroupLabel;

    private String movementPattern;

    private String description;

    private boolean active;

    private Instant createdAt;

    protected Exercise() {
    }

    private Exercise(
        int catalogId,
        String name,
        MuscleGroup muscleGroup,
        String movementPattern,
        String description,
        Instant createdAt
    ) {
        this.catalogId = catalogId;
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.muscleGroupLabel = muscleGroup.getLabel();
        this.movementPattern = movementPattern;
        this.description = description;
        this.active = true;
        this.createdAt = createdAt;
    }

    public static Exercise seed(
        int catalogId,
        String name,
        MuscleGroup muscleGroup,
        String movementPattern,
        String description
    ) {
        return new Exercise(catalogId, name, muscleGroup, movementPattern, description, Instant.now());
    }

    public String getId() {
        return id;
    }

    public int getCatalogId() {
        return catalogId;
    }

    public String getName() {
        return name;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public String getMuscleGroupLabel() {
        return muscleGroupLabel;
    }

    public String getMovementPattern() {
        return movementPattern;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
