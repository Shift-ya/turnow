package com.turnow.domain.appointment.repository;

import com.turnow.domain.appointment.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID>, JpaSpecificationExecutor<Appointment> {

    Page<Appointment> findByTenantId(UUID tenantId, Pageable pageable);

    List<Appointment> findByTenantIdAndAppointmentDate(UUID tenantId, LocalDate date);

    List<Appointment> findByTenantIdAndAppointmentDateBetween(
        UUID tenantId, LocalDate from, LocalDate to
    );

    List<Appointment> findByTenantIdAndProfessionalIdAndAppointmentDate(
        UUID tenantId, UUID professionalId, LocalDate date
    );

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.tenantId = :tenantId
          AND a.professionalId = :professionalId
          AND a.appointmentDate BETWEEN :from AND :to
          AND a.status NOT IN ('CANCELLED')
        ORDER BY a.appointmentDate, a.startTime
    """)
    List<Appointment> findActiveByProfessionalAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("professionalId") UUID professionalId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.tenantId = :tenantId
          AND a.professionalId = :professionalId
          AND a.appointmentDate = :date
          AND a.status NOT IN ('CANCELLED')
          AND a.startTime < :endTime
          AND a.endTime > :startTime
          AND (:excludeId IS NULL OR a.id != :excludeId)
    """)
    boolean existsConflict(
        @Param("tenantId") UUID tenantId,
        @Param("professionalId") UUID professionalId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeId") UUID excludeId
    );

    Optional<Appointment> findByCancellationToken(String cancellationToken);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.tenantId = :tenantId AND a.status = :status")
    long countByTenantIdAndStatus(
        @Param("tenantId") UUID tenantId,
        @Param("status") Appointment.AppointmentStatus status
    );

    @Query("""
        SELECT COUNT(a) FROM Appointment a
        WHERE a.tenantId = :tenantId
          AND a.appointmentDate BETWEEN :from AND :to
    """)
    long countByTenantIdAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.status IN ('BOOKED', 'CONFIRMED')
          AND a.reminderSent = false
          AND a.appointmentDate = :targetDate
    """)
    List<Appointment> findAppointmentsNeedingReminder(@Param("targetDate") LocalDate targetDate);
}
