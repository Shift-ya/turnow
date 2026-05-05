package com.turnow.infrastructure.seed;

import com.turnow.domain.appointment.entity.Appointment;
import com.turnow.domain.appointment.repository.AppointmentRepository;
import com.turnow.domain.availability.entity.Availability;
import com.turnow.domain.availability.repository.AvailabilityRepository;
import com.turnow.domain.professional.entity.Professional;
import com.turnow.domain.professional.repository.ProfessionalRepository;
import com.turnow.domain.service.entity.Service;
import com.turnow.domain.service.repository.ServiceRepository;
import com.turnow.domain.tenant.entity.Tenant;
import com.turnow.domain.tenant.repository.TenantRepository;
import com.turnow.domain.user.entity.User;
import com.turnow.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Component
@Profile("!prod")
@RequiredArgsConstructor
public class InitialDataLoader implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ProfessionalRepository professionalRepository;
    private final ServiceRepository serviceRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (tenantRepository.count() > 0) {
            return;
        }

        Tenant bellaVida = tenantRepository.saveAndFlush(
            Tenant.builder()
                .businessName("Bella Vida Spa")
                .slug("bella-vida-spa")
                .email("info@bellavida.com")
                .phone("+54 11 4567-8901")
                .address("Av. Corrientes 1234, CABA")
                .city("Buenos Aires")
                .country("Argentina")
                .status(Tenant.TenantStatus.ACTIVE)
                .plan(Tenant.SubscriptionPlan.PROFESSIONAL)
                .planExpiresAt(LocalDateTime.now().plusMonths(1))
                .build()
        );

        Tenant fitZone = tenantRepository.saveAndFlush(
            Tenant.builder()
                .businessName("FitZone Gym")
                .slug("fitzone-gym")
                .email("info@fitzone.com")
                .phone("+54 11 9876-5432")
                .address("Av. Santa Fe 5678, CABA")
                .city("Buenos Aires")
                .country("Argentina")
                .status(Tenant.TenantStatus.ACTIVE)
                .plan(Tenant.SubscriptionPlan.BASIC)
                .planExpiresAt(LocalDateTime.now().plusMonths(1))
                .build()
        );

        // Tenant settings se inicializan cuando se guardan desde el panel.

        userRepository.save(
            User.builder()
                .email("admin@turnow.com")
                .passwordHash(passwordEncoder.encode("demo123"))
                .firstName("Carlos")
                .lastName("Admin")
                .role(User.Role.SUPER_ADMIN)
                .active(true)
                .emailVerified(true)
                .build()
        );

        userRepository.save(
            User.builder()
                .tenantId(bellaVida.getId())
                .email("maria@bellavida.com")
                .passwordHash(passwordEncoder.encode("demo123"))
                .firstName("Maria")
                .lastName("Lopez")
                .role(User.Role.TENANT_ADMIN)
                .active(true)
                .emailVerified(true)
                .build()
        );

        userRepository.save(
            User.builder()
                .tenantId(bellaVida.getId())
                .email("pedro@bellavida.com")
                .passwordHash(passwordEncoder.encode("demo123"))
                .firstName("Pedro")
                .lastName("Garcia")
                .role(User.Role.STAFF)
                .active(true)
                .emailVerified(true)
                .build()
        );

        userRepository.save(
            User.builder()
                .tenantId(fitZone.getId())
                .email("ana@fitzone.com")
                .passwordHash(passwordEncoder.encode("demo123"))
                .firstName("Ana")
                .lastName("Martinez")
                .role(User.Role.TENANT_ADMIN)
                .active(true)
                .emailVerified(true)
                .build()
        );

        Service massage = serviceRepository.save(
            Service.builder()
                .tenantId(bellaVida.getId())
                .name("Masaje Relajante")
                .description("Masaje corporal completo de relajacion")
                .durationMinutes(60)
                .price(BigDecimal.valueOf(8500))
                .active(true)
                .build()
        );

        Service facial = serviceRepository.save(
            Service.builder()
                .tenantId(bellaVida.getId())
                .name("Limpieza Facial")
                .description("Limpieza profunda con productos premium")
                .durationMinutes(45)
                .price(BigDecimal.valueOf(6000))
                .active(true)
                .build()
        );

        Service training = serviceRepository.save(
            Service.builder()
                .tenantId(fitZone.getId())
                .name("Personal Training")
                .description("Sesion personalizada 1 a 1")
                .durationMinutes(60)
                .price(BigDecimal.valueOf(7000))
                .active(true)
                .build()
        );

        Professional laura = professionalRepository.save(
            Professional.builder()
                .tenantId(bellaVida.getId())
                .firstName("Laura")
                .lastName("Sanchez")
                .email("laura@bellavida.com")
                .phone("+54 11 1111-1111")
                .bio("Masajes")
                .active(true)
                .services(Set.of(massage, facial))
                .build()
        );

        Professional diego = professionalRepository.save(
            Professional.builder()
                .tenantId(bellaVida.getId())
                .firstName("Diego")
                .lastName("Fernandez")
                .email("diego@bellavida.com")
                .phone("+54 11 2222-2222")
                .bio("Faciales")
                .active(true)
                .services(Set.of(facial))
                .build()
        );

        Professional martin = professionalRepository.save(
            Professional.builder()
                .tenantId(fitZone.getId())
                .firstName("Martin")
                .lastName("Ruiz")
                .email("martin@fitzone.com")
                .phone("+54 11 4444-4444")
                .bio("Personal Trainer")
                .active(true)
                .services(Set.of(training))
                .build()
        );

        for (Professional p : Set.of(laura, diego, martin)) {
            for (DayOfWeek day : Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY)) {
                availabilityRepository.save(
                    Availability.builder()
                        .tenantId(p.getTenantId())
                        .professionalId(p.getId())
                        .dayOfWeek(day)
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(18, 0))
                        .active(true)
                        .build()
                );
            }
        }

        appointmentRepository.save(
            Appointment.builder()
                .tenantId(bellaVida.getId())
                .professionalId(laura.getId())
                .serviceId(massage.getId())
                .clientName("Juan Perez")
                .clientEmail("juan@email.com")
                .clientPhone("+54 11 9999-0001")
                .appointmentDate(LocalDate.now())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .status(Appointment.AppointmentStatus.BOOKED)
                .cancellationToken(UUID.randomUUID().toString())
                .build()
        );

        appointmentRepository.save(
            Appointment.builder()
                .tenantId(bellaVida.getId())
                .professionalId(diego.getId())
                .serviceId(facial.getId())
                .clientName("Carolina Vega")
                .clientEmail("carolina@email.com")
                .clientPhone("+54 11 9999-0002")
                .appointmentDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(11, 45))
                .status(Appointment.AppointmentStatus.BOOKED)
                .cancellationToken(UUID.randomUUID().toString())
                .build()
        );
    }
}
