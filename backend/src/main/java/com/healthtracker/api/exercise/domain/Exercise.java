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

    @Indexed
    private String ownerUserId;

    private String name;

    @Indexed
    private MuscleGroup muscleGroup;

    private String muscleGroupLabel;

    private String movementPattern;

    private String description;

    private boolean active;

    private boolean defaultExercise;

    private Instant createdAt;

    private Instant updatedAt;

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
        this.ownerUserId = null;
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.muscleGroupLabel = muscleGroup.getLabel();
        this.movementPattern = movementPattern;
        this.description = description;
        this.active = true;
        this.defaultExercise = true;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    private Exercise(
        int catalogId,
        String ownerUserId,
        String name,
        MuscleGroup muscleGroup,
        String movementPattern,
        String description,
        Instant createdAt
    ) {
        this.catalogId = catalogId;
        this.ownerUserId = ownerUserId;
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.muscleGroupLabel = muscleGroup.getLabel();
        this.movementPattern = movementPattern;
        this.description = description;
        this.active = true;
        this.defaultExercise = false;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
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

    public static Exercise custom(
        int catalogId,
        String ownerUserId,
        String name,
        MuscleGroup muscleGroup,
        String movementPattern,
        String description
    ) {
        return new Exercise(catalogId, ownerUserId, name, muscleGroup, movementPattern, description, Instant.now());
    }

    public boolean isVisibleTo(String userId) {
        return defaultExercise || ownerUserId == null || ownerUserId.equals(userId);
    }

    public boolean isOwnedBy(String userId) {
        return ownerUserId != null && ownerUserId.equals(userId);
    }

    public void deactivate() {
        this.active = false;
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public int getCatalogId() {
        return catalogId;
    }

    public String getOwnerUserId() {
        return ownerUserId;
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

    public boolean isDefaultExercise() {
        return defaultExercise || ownerUserId == null;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
