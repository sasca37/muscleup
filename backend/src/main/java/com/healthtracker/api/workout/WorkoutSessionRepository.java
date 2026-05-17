package com.healthtracker.api.workout;

import com.healthtracker.api.auth.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    @Query("""
        select distinct session from WorkoutSession session
        left join fetch session.records records
        left join fetch records.machine
        where session.user = :user
        and session.workoutDate between :from and :to
        order by session.workoutDate desc, session.createdAt desc
        """)
    List<WorkoutSession> findSessions(
        @Param("user") UserAccount user,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );
}
