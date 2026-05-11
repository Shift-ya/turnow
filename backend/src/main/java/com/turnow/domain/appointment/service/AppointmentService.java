package com.turnow.domain.appointment.service;

import com.turnow.domain.appointment.dto.AppointmentResponse;
import com.turnow.domain.appointment.dto.CreateAppointmentRequest;
import com.turnow.domain.appointment.entity.Appointment;
import com.turnow.domain.appointment.repository.AppointmentRepository;
import com.turnow.domain.notification.service.NotificationService;
import com.turnow.domain.professional.entity.Professional;
import com.turnow.domain.professional.repository.ProfessionalRepository;
import com.turnow.domain.service.entity.Service;
import com.turnow.domain.service.repository.ServiceRepository;
import com.turnow.domain.tenant.entity.Tenant;
import com.turnow.domain.tenant.repository.TenantRepository;
import com.turnow.domain.tenant.entity.TenantSettings;
import com.turnow.domain.tenant.repository.TenantSettingsRepository;
import com.turnow.infrastructure.exception.BusinessException;
import com.turnow.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Lógica central de gestión de turnos.
 * Responsable de: creación, cancelación, completado y consultas.
 */
@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ProfessionalRepository professionalRepository;
    private final ServiceRepository serviceRepository;
    private final TenantRepository tenantRepository;
    private final TenantSettingsRepository tenantSettingsRepository;
    private final NotificationService notificationService;

    /**
     * Crea un nuevo turno con validación de conflictos.
     */
    @Transactional
    public AppointmentResponse createAppointment(UUID tenantId, CreateAppointmentRequest req) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant no encontrado"));

        // 1. Validar que el profesional pertenece al tenant
        Professional professional = professionalRepository
            .findByIdAndTenantId(req.professionalId(), tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Profesional no encontrado"));

        // 2. Validar que el servicio pertenece al tenant
        Service service = serviceRepository
            .findByIdAndTenantId(req.serviceId(), tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));

        // 3. Calcular hora de fin
        LocalTime endTime = req.startTime().plusMinutes(service.getDurationMinutes());

        // 4. Validar anticipación mínima
        TenantSettings settings = tenantSettingsRepository.findById(tenantId).orElse(null);
        if (settings != null) {
            LocalDateTime minBookingTime = LocalDateTime.now()
                .plusMinutes(settings.getMinAdvanceMinutes());
            LocalDateTime appointmentDateTime = LocalDateTime.of(req.appointmentDate(), req.startTime());

            if (appointmentDateTime.isBefore(minBookingTime)) {
                throw new BusinessException(
                    "Debe reservar con al menos " + settings.getMinAdvanceMinutes() + " minutos de anticipación"
                );
            }

            // Validar anticipación máxima
            LocalDate maxDate = LocalDate.now().plusDays(settings.getMaxAdvanceDays());
            if (req.appointmentDate().isAfter(maxDate)) {
                throw new BusinessException(
                    "Solo puede reservar hasta " + settings.getMaxAdvanceDays() + " días en adelante"
                );
            }
        }

        // 5. Verificar conflicto de horario — CRÍTICO para evitar doble reserva
        boolean hasConflict = appointmentRepository.existsConflict(
            tenantId, req.professionalId(), req.appointmentDate(),
            req.startTime(), endTime, null
        );

        if (hasConflict) {
            throw new BusinessException("El horario seleccionado ya no está disponible. Por favor elige otro.");
        }

        // 6. Crear el turno
        Appointment appointment = Appointment.builder()
            .tenant(tenant)
            .professionalId(req.professionalId())
            .serviceId(req.serviceId())
            .appointmentDate(req.appointmentDate())
            .startTime(req.startTime())
            .endTime(endTime)
            .clientName(req.clientName())
            .clientEmail(req.clientEmail())
            .clientPhone(req.clientPhone())
            .clientNotes(req.clientNotes())
            .status(Appointment.AppointmentStatus.BOOKED)
            .cancellationToken(UUID.randomUUID().toString())
            .build();

        appointment = appointmentRepository.save(appointment);
        log.info("Turno creado: {} para tenant: {}", appointment.getId(), tenantId);

        // 7. Enviar confirmación por email (async)
        notificationService.sendConfirmation(appointment, professional, service);

        return mapToResponse(appointment, professional.getFullName(), service.getName());
    }

    /**
     * Cancela un turno usando el token público (sin autenticación).
     */
    @Transactional
    public void cancelByToken(String cancellationToken) {
        Appointment appointment = appointmentRepository
            .findByCancellationToken(cancellationToken)
            .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado"));

        if (!appointment.isUpcoming()) {
            throw new BusinessException("Este turno no puede ser cancelado");
        }

        // Verificar anticipación mínima para cancelar
        TenantSettings settings = tenantSettingsRepository.findById(appointment.getTenantId()).orElse(null);
        if (settings != null && settings.getCancellationsAllowed() != null && !settings.getCancellationsAllowed()) {
            throw new BusinessException("Este negocio no permite cancelaciones online");
        }

        if (settings != null && settings.getCancellationHoursBefore() != null) {
            LocalDateTime minCancelTime = LocalDateTime.of(
                appointment.getAppointmentDate(),
                appointment.getStartTime()
            ).minusHours(settings.getCancellationHoursBefore());

            if (LocalDateTime.now().isAfter(minCancelTime)) {
                throw new BusinessException(
                    "Solo puede cancelar con al menos " + settings.getCancellationHoursBefore() + " horas de anticipación"
                );
            }
        }

        appointment.cancel();
        appointmentRepository.save(appointment);
        notificationService.sendCancellationNotification(appointment);

        log.info("Turno cancelado via token: {}", appointment.getId());
    }

    /**
     * Cancela un turno por ID (desde el panel admin).
     */
    @Transactional
    public void cancelByAdmin(UUID tenantId, UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado"));

        if (!appointment.getTenantId().equals(tenantId)) {
            throw new BusinessException("No tiene permiso para cancelar este turno");
        }

        appointment.cancel();
        appointmentRepository.save(appointment);
    }

    /**
     * Marca un turno como completado.
     */
    @Transactional
    public AppointmentResponse completeAppointment(UUID tenantId, UUID appointmentId) {
        Appointment appointment = getByIdAndTenant(appointmentId, tenantId);
        appointment.complete();
        appointment = appointmentRepository.save(appointment);
        return mapToResponseSimple(appointment);
    }

    /**
     * Marca un turno como NO_SHOW.
     */
    @Transactional
    public AppointmentResponse markNoShow(UUID tenantId, UUID appointmentId) {
        Appointment appointment = getByIdAndTenant(appointmentId, tenantId);
        appointment.markNoShow();
        appointment = appointmentRepository.save(appointment);
        return mapToResponseSimple(appointment);
    }

    // ─── Consultas ────────────────────────────────────────────────────────────

    public Page<AppointmentResponse> getByTenant(UUID tenantId, Pageable pageable) {
        return appointmentRepository.findByTenantId(tenantId, pageable)
            .map(this::mapToResponseSimple);
    }

    public List<AppointmentResponse> getByDate(UUID tenantId, LocalDate date) {
        return appointmentRepository.findByTenantIdAndAppointmentDate(tenantId, date)
            .stream()
            .map(this::mapToResponseSimple)
            .toList();
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    private Appointment getByIdAndTenant(UUID appointmentId, UUID tenantId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado"));

        if (!appointment.getTenantId().equals(tenantId)) {
            throw new BusinessException("Acceso denegado");
        }

        return appointment;
    }

    private AppointmentResponse mapToResponse(Appointment a, String professionalName, String serviceName) {
        return new AppointmentResponse(
            a.getId(), a.getTenantId(), a.getTenant() == null ? null : a.getTenant().getBusinessName(), a.getProfessionalId(), professionalName,
            a.getServiceId(), serviceName, a.getClientName(), a.getClientEmail(),
            a.getClientPhone(), a.getAppointmentDate(), a.getStartTime(), a.getEndTime(),
            a.getStatus(), a.getClientNotes(), a.getInternalNotes(),
            a.getCancellationToken(), a.getCreatedAt()
        );
    }

    private AppointmentResponse mapToResponseSimple(Appointment a) {
        return mapToResponse(a, null, null);
    }
}
