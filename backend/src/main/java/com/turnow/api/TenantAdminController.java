package com.turnow.api;

import com.turnow.domain.appointment.entity.Appointment;
import com.turnow.domain.appointment.repository.AppointmentRepository;
import com.turnow.domain.professional.entity.Professional;
import com.turnow.domain.professional.repository.ProfessionalRepository;
import com.turnow.domain.service.entity.Service;
import com.turnow.domain.service.repository.ServiceRepository;
import com.turnow.domain.tenant.entity.Tenant;
import com.turnow.domain.tenant.entity.TenantSettings;
import com.turnow.domain.tenant.repository.TenantRepository;
import com.turnow.domain.tenant.repository.TenantSettingsRepository;
import com.turnow.domain.user.entity.User;
import com.turnow.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/tenant")
@RequiredArgsConstructor
public class TenantAdminController {

    private final TenantRepository tenantRepository;
    private final TenantSettingsRepository tenantSettingsRepository;
    private final AppointmentRepository appointmentRepository;
    private final ProfessionalRepository professionalRepository;
    private final ServiceRepository serviceRepository;

    @GetMapping("/{tenantId}/overview")
    public ResponseEntity<TenantOverviewDto> getOverview(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId) {
        requireTenantAccess(currentUser, tenantId);
        Tenant tenant = getTenant(tenantId);

        List<Appointment> allAppointments = appointmentRepository.findByTenantId(tenantId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        long todayAppointments = allAppointments.stream().filter(a -> a.getAppointmentDate().equals(today)).count();
        long weekAppointments = allAppointments.stream().filter(a -> !a.getAppointmentDate().isBefore(weekStart) && !a.getAppointmentDate().isAfter(today)).count();

        long completed = allAppointments.stream().filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED).count();
        long cancelled = allAppointments.stream().filter(a -> a.getStatus() == Appointment.AppointmentStatus.CANCELLED).count();
        long noShow = allAppointments.stream().filter(a -> a.getStatus() == Appointment.AppointmentStatus.NO_SHOW).count();
        long total = Math.max(allAppointments.size(), 1);

        double revenue = allAppointments.stream()
            .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED || a.getStatus() == Appointment.AppointmentStatus.BOOKED)
            .map(Appointment::getServiceId)
            .map(serviceRepository::findById)
            .flatMap(java.util.Optional::stream)
            .map(Service::getPrice)
            .filter(java.util.Objects::nonNull)
            .mapToDouble(BigDecimal::doubleValue)
            .sum();

        List<AppointmentDto> appointments = allAppointments.stream()
            .sorted((a, b) -> {
                int cmp = b.getAppointmentDate().compareTo(a.getAppointmentDate());
                return cmp != 0 ? cmp : b.getStartTime().compareTo(a.getStartTime());
            })
            .map(this::toAppointmentDto)
            .toList();

        // Get TenantSettings for primaryColor
        TenantSettings settings = tenantSettingsRepository.findById(tenantId).orElse(null);
        String primaryColor = settings != null ? settings.getPrimaryColor() : "#6366f1";

        return ResponseEntity.ok(
            new TenantOverviewDto(
                new TenantDto(tenant.getId().toString(), tenant.getBusinessName(), tenant.getSlug(), tenant.getEmail(), tenant.getPhone(), tenant.getAddress(), tenant.getStatus().name(), tenant.getPlan().name(), primaryColor),
                new TenantMetricsDto(
                    allAppointments.size(),
                    todayAppointments,
                    weekAppointments,
                    roundPct(completed, total),
                    roundPct(cancelled, total),
                    roundPct(noShow, total),
                    revenue,
                    0
                ),
                appointments,
                professionalRepository.findByTenantId(tenantId).stream().map(this::toProfessionalDto).toList(),
                serviceRepository.findAll().stream().filter(s -> s.getTenantId().equals(tenantId)).map(this::toServiceDto).toList()
            )
        );
    }

    @GetMapping("/{tenantId}/appointments")
    public ResponseEntity<List<AppointmentDto>> getAppointments(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID tenantId,
        @RequestParam(required = false) LocalDate date
    ) {
        requireTenantAccess(currentUser, tenantId);
        List<Appointment> appointments = date == null
            ? appointmentRepository.findByTenantId(tenantId, org.springframework.data.domain.Pageable.unpaged()).getContent()
            : appointmentRepository.findByTenantIdAndAppointmentDate(tenantId, date);

        return ResponseEntity.ok(appointments.stream().map(this::toAppointmentDto).toList());
    }

    @GetMapping("/{tenantId}/professionals")
    public ResponseEntity<List<ProfessionalDto>> getProfessionals(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId) {
        requireTenantAccess(currentUser, tenantId);
        return ResponseEntity.ok(professionalRepository.findByTenantId(tenantId).stream().map(this::toProfessionalDto).toList());
    }

    @PostMapping("/{tenantId}/professionals")
    public ResponseEntity<ProfessionalDto> createProfessional(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId, @RequestBody ProfessionalUpsertRequest request) {
        requireTenantAccess(currentUser, tenantId);
        Professional professional = Professional.builder()
            .tenantId(tenantId)
            .firstName(request.firstName())
            .lastName(request.lastName())
            .email(request.email())
            .phone(request.phone())
            .bio(request.speciality())
            .active(true)
            .build();
        return ResponseEntity.ok(toProfessionalDto(professionalRepository.save(professional)));
    }

    @PutMapping("/{tenantId}/professionals/{professionalId}")
    public ResponseEntity<ProfessionalDto> updateProfessional(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID tenantId,
        @PathVariable UUID professionalId,
        @RequestBody ProfessionalUpsertRequest request
    ) {
        requireTenantAccess(currentUser, tenantId);
        Professional professional = professionalRepository.findByIdAndTenantId(professionalId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Profesional no encontrado"));
        professional.setFirstName(request.firstName());
        professional.setLastName(request.lastName());
        professional.setEmail(request.email());
        professional.setPhone(request.phone());
        professional.setBio(request.speciality());
        professional.setActive(request.active());
        return ResponseEntity.ok(toProfessionalDto(professionalRepository.save(professional)));
    }

    @DeleteMapping("/{tenantId}/professionals/{professionalId}")
    public ResponseEntity<Void> deactivateProfessional(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId, @PathVariable UUID professionalId) {
        requireTenantAccess(currentUser, tenantId);
        Professional professional = professionalRepository.findByIdAndTenantId(professionalId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Profesional no encontrado"));
        professional.setActive(false);
        professionalRepository.save(professional);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tenantId}/services")
    public ResponseEntity<List<ServiceDto>> getServices(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId) {
        requireTenantAccess(currentUser, tenantId);
        return ResponseEntity.ok(serviceRepository.findAll().stream().filter(s -> s.getTenantId().equals(tenantId)).map(this::toServiceDto).toList());
    }

    @PostMapping("/{tenantId}/services")
    public ResponseEntity<ServiceDto> createService(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId, @RequestBody ServiceUpsertRequest request) {
        requireTenantAccess(currentUser, tenantId);
        Service service = Service.builder()
            .tenantId(tenantId)
            .name(request.name())
            .description(request.description())
            .durationMinutes(request.duration())
            .price(BigDecimal.valueOf(request.price()))
            .active(true)
            .build();
        return ResponseEntity.ok(toServiceDto(serviceRepository.save(service)));
    }

    @PutMapping("/{tenantId}/services/{serviceId}")
    public ResponseEntity<ServiceDto> updateService(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID tenantId,
        @PathVariable UUID serviceId,
        @RequestBody ServiceUpsertRequest request
    ) {
        requireTenantAccess(currentUser, tenantId);
        Service service = serviceRepository.findByIdAndTenantId(serviceId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));
        service.setName(request.name());
        service.setDescription(request.description());
        service.setDurationMinutes(request.duration());
        service.setPrice(BigDecimal.valueOf(request.price()));
        service.setActive(request.active());
        return ResponseEntity.ok(toServiceDto(serviceRepository.save(service)));
    }

    @DeleteMapping("/{tenantId}/services/{serviceId}")
    public ResponseEntity<Void> deleteService(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId, @PathVariable UUID serviceId) {
        requireTenantAccess(currentUser, tenantId);
        Service service = serviceRepository.findByIdAndTenantId(serviceId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));
        serviceRepository.delete(service);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{tenantId}/settings")
    public ResponseEntity<TenantDto> updateSettings(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId, @RequestBody TenantSettingsRequest request) {
        requireTenantAccess(currentUser, tenantId);
        Tenant tenant = getTenant(tenantId);
        tenant.setBusinessName(request.businessName());
        tenant.setEmail(request.email());
        tenant.setPhone(request.phone());
        tenant.setAddress(request.address());
        tenant.setSlug(request.slug());
        tenantRepository.saveAndFlush(tenant);

        // Buscar o crear TenantSettings
        TenantSettings settings = tenantSettingsRepository.findById(tenantId).orElse(null);
        
        if (settings == null) {
            // Crear nueva instancia solo asignando el tenant (el ID se deduce automáticamente)
            settings = new TenantSettings();
            settings.setTenant(tenant);
            settings.setPrimaryColor(request.primaryColor() != null ? request.primaryColor() : "#6366f1");
        } else {
            // Actualizar solo si se proporciona un color diferente
            if (request.primaryColor() != null && !request.primaryColor().equals(settings.getPrimaryColor())) {
                settings.setPrimaryColor(request.primaryColor());
            }
        }
        
        tenantSettingsRepository.saveAndFlush(settings);

        return ResponseEntity.ok(new TenantDto(
            tenant.getId().toString(),
            tenant.getBusinessName(),
            tenant.getSlug(),
            tenant.getEmail(),
            tenant.getPhone(),
            tenant.getAddress(),
            tenant.getStatus().name(),
            tenant.getPlan().name(),
            settings.getPrimaryColor()
        ));
    }

    private Tenant getTenant(UUID tenantId) {
        return tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant no encontrado"));
    }

    private double roundPct(long value, long total) {
        return Math.round(((double) value * 10000.0) / total) / 100.0;
    }

    private AppointmentDto toAppointmentDto(Appointment a) {
        return new AppointmentDto(
            a.getId().toString(),
            a.getTenantId().toString(),
            a.getServiceId().toString(),
            a.getProfessionalId().toString(),
            a.getClientName(),
            a.getClientEmail(),
            a.getClientPhone(),
            a.getAppointmentDate().toString(),
            a.getStartTime().toString(),
            a.getEndTime().toString(),
            a.getStatus().name(),
            a.getClientNotes(),
            a.getCreatedAt() == null ? null : a.getCreatedAt().toString()
        );
    }

    private ProfessionalDto toProfessionalDto(Professional p) {
        return new ProfessionalDto(
            p.getId().toString(),
            p.getTenantId().toString(),
            p.getFullName(),
            p.getEmail(),
            p.getPhone(),
            p.getBio(),
            p.getActive()
        );
    }

    private ServiceDto toServiceDto(Service s) {
        return new ServiceDto(
            s.getId().toString(),
            s.getTenantId().toString(),
            s.getName(),
            s.getDescription(),
            s.getDurationMinutes(),
            s.getPrice() == null ? 0 : s.getPrice().doubleValue(),
            "ARS",
            s.getActive(),
            "General"
        );
    }

    private void requireTenantAccess(User currentUser, UUID tenantId) {
        if (currentUser == null) {
            throw new AccessDeniedException("No autorizado");
        }

        if (currentUser.getRole() == User.Role.SUPER_ADMIN) {
            return;
        }

        if (currentUser.getTenantId() == null || !currentUser.getTenantId().equals(tenantId)) {
            throw new AccessDeniedException("No autorizado");
        }
    }

    public record TenantOverviewDto(
        TenantDto tenant,
        TenantMetricsDto metrics,
        List<AppointmentDto> appointments,
        List<ProfessionalDto> professionals,
        List<ServiceDto> services
    ) {}

    public record TenantDto(
        String id,
        String name,
        String slug,
        String email,
        String phone,
        String address,
        String status,
        String plan,
        String primaryColor
    ) {}

    public record TenantMetricsDto(
        long totalAppointments,
        long todayAppointments,
        long weekAppointments,
        double completedRate,
        double cancelledRate,
        double noShowRate,
        double revenue,
        long newClients
    ) {}

    public record AppointmentDto(
        String id,
        String tenantId,
        String serviceId,
        String professionalId,
        String clientName,
        String clientEmail,
        String clientPhone,
        String date,
        String startTime,
        String endTime,
        String status,
        String notes,
        String createdAt
    ) {}

    public record ProfessionalDto(
        String id,
        String tenantId,
        String name,
        String email,
        String phone,
        String speciality,
        boolean active
    ) {}

    public record ServiceDto(
        String id,
        String tenantId,
        String name,
        String description,
        int duration,
        double price,
        String currency,
        boolean active,
        String category
    ) {}

    public record ProfessionalUpsertRequest(
        String firstName,
        String lastName,
        String email,
        String phone,
        String speciality,
        boolean active
    ) {}

    public record ServiceUpsertRequest(
        String name,
        String description,
        int duration,
        double price,
        boolean active
    ) {}

    public record TenantSettingsRequest(
        String businessName,
        String email,
        String phone,
        String address,
        String slug,
        String primaryColor
    ) {}
}
