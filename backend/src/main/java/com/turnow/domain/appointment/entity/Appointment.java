package com.turnow.domain.appointment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;
import com.turnow.domain.tenant.entity.Tenant;

/**
 * Turno/Cita reservada.
 * Entidad central del sistema — conecta cliente, profesional y servicio.
 */
@Entity
@Table(
    name = "appointments",
    indexes = {
        @Index(name = "idx_appointments_tenant_id", columnList = "tenant_id"),
        @Index(name = "idx_appointments_professional_date", columnList = "professional_id, appointment_date"),
        @Index(name = "idx_appointments_client_id", columnList = "client_id"),
        @Index(name = "idx_appointments_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** Aislamiento multi-tenant */
    @Column(name = "tenant_id", nullable = false, insertable = false, updatable = false)
    private UUID tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /** ID del profesional que atiende */
    @Column(name = "professional_id", nullable = false)
    private UUID professionalId;

    /** ID del servicio reservado */
    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    /** ID del cliente (User con rol CLIENT) */
    @Column(name = "client_id")
    private UUID clientId;

    // ─── Datos del cliente (desnormalizados para acceso rápido) ─────────────

    @Column(name = "client_name", nullable = false, length = 200)
    private String clientName;

    @Column(name = "client_email", nullable = false, length = 255)
    private String clientEmail;

    @Column(name = "client_phone", length = 50)
    private String clientPhone;

    // ─── Datos del turno ─────────────────────────────────────────────────────

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.BOOKED;

    /** Notas internas del profesional */
    @Column(name = "internal_notes", length = 1000)
    private String internalNotes;

    /** Notas del cliente al reservar */
    @Column(name = "client_notes", length = 500)
    private String clientNotes;

    /** Token único para cancelación pública sin login */
    @Column(name = "cancellation_token", unique = true, length = 100)
    private String cancellationToken;

    // ─── Control de notificaciones ────────────────────────────────────────────

    @Column(name = "confirmation_sent")
    @Builder.Default
    private Boolean confirmationSent = false;

    @Column(name = "reminder_sent")
    @Builder.Default
    private Boolean reminderSent = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ─── Enum de estados ─────────────────────────────────────────────────────

    public enum AppointmentStatus {
        BOOKED,      // Reservado
        CONFIRMED,   // Confirmado por el negocio
        CANCELLED,   // Cancelado
        COMPLETED,   // Completado
        NO_SHOW      // El cliente no se presentó
    }

    // ─── Métodos de negocio ──────────────────────────────────────────────────

    public boolean isCancellable() {
        return status == AppointmentStatus.BOOKED || status == AppointmentStatus.CONFIRMED;
    }

    public boolean isUpcoming() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointmentDate, startTime);
        return appointmentDateTime.isAfter(now) && isCancellable();
    }

    public void cancel() {
        if (!isCancellable()) {
            throw new IllegalStateException("El turno no puede ser cancelado en su estado actual: " + status);
        }
        this.status = AppointmentStatus.CANCELLED;
    }

    public void complete() {
        this.status = AppointmentStatus.COMPLETED;
    }

    public void markNoShow() {
        this.status = AppointmentStatus.NO_SHOW;
    }
}
