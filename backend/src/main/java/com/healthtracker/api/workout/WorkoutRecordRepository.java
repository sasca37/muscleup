package com.healthtracker.api.workout;

import com.healthtracker.api.auth.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkoutRecordRepository extends JpaRepository<WorkoutRecord, Long> {

    @Query("""
        select distinct record from WorkoutRecord record
        join fetch record.session session
        join fetch record.machine machine
        left join fetch record.sets
        where session.user = :user
        and machine.id = :machineId
        order by session.workoutDate desc, session.createdAt desc, record.id desc
        """)
    List<WorkoutRecord> findHistory(
        @Param("user") UserAccount user,
        @Param("machineId") Long machineId
    );
}

