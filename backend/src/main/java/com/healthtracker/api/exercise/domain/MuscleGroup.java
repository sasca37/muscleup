package com.healthtracker.api.exercise.domain;

public enum MuscleGroup {
    CHEST("가슴"),
    BACK("등"),
    LEGS("하체"),
    SHOULDERS("어깨"),
    ARMS("팔"),
    CORE("복근");

    private final String label;

    MuscleGroup(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
