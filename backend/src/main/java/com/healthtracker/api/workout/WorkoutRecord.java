package com.healthtracker.api.workout;

import com.healthtracker.api.machine.ExerciseMachine;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
public class WorkoutRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private WorkoutSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private ExerciseMachine machine;

    private String note;

    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutSet> sets = new ArrayList<>();

    protected WorkoutRecord() {
    }

    public WorkoutRecord(ExerciseMachine machine, String note) {
        this.machine = machine;
        this.note = note;
    }

    void setSession(WorkoutSession session) {
        this.session = session;
    }

    public void addSet(WorkoutSet set) {
        sets.add(set);
        set.setRecord(this);
    }

    public Long getId() {
        return id;
    }

    public WorkoutSession getSession() {
        return session;
    }

    public ExerciseMachine getMachine() {
        return machine;
    }

    public String getNote() {
        return note;
    }

    public List<WorkoutSet> getSets() {
        return sets;
    }
}

