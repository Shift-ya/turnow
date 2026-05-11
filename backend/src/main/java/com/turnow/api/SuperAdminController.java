package com.turnow.api;

import com.turnow.domain.tenant.entity.Tenant;
import com.turnow.domain.tenant.repository.TenantRepository;
import com.turnow.domain.user.entity.User;
import com.turnow.domain.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.turnow.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/super")
@RequiredArgsConstructor
public class SuperAdminController {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/overview")
    public ResponseEntity<GlobalOverviewDto> overview(@AuthenticationPrincipal User currentUser) {
        requireSuperAdmin(currentUser);
        List<Tenant> tenants = tenantRepository.findAll();
        long activeTenants = tenants.stream().filter(t -> t.getStatus() == Tenant.TenantStatus.ACTIVE).count();
        long basic = tenants.stream().filter(t -> t.getPlan() == Tenant.SubscriptionPlan.BASIC).count();
        long professional = tenants.stream().filter(t -> t.getPlan() == Tenant.SubscriptionPlan.PROFESSIONAL).count();
        long premium = tenants.stream().filter(t -> t.getPlan() == Tenant.SubscriptionPlan.PREMIUM).count();

        return ResponseEntity.ok(
            new GlobalOverviewDto(
                tenants.size(),
                activeTenants,
                0,
                0,
                0,
                new PlanDistributionDto(basic, professional, premium)
            )
        );
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantDto>> tenants(@AuthenticationPrincipal User currentUser, @RequestParam(required = false) String search) {
        requireSuperAdmin(currentUser);
        String query = search == null ? "" : search.toLowerCase();
        List<TenantDto> response = tenantRepository.findAll().stream()
            .filter(t ->
                query.isBlank()
                    || t.getBusinessName().toLowerCase().contains(query)
                    || (t.getEmail() != null && t.getEmail().toLowerCase().contains(query))
            )
            .map(this::toDto)
            .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tenants")
    public ResponseEntity<TenantDto> createTenant(@AuthenticationPrincipal User currentUser, @RequestBody TenantCreateRequest request) {
        requireSuperAdmin(currentUser);
        Tenant tenant = Tenant.builder()
            .businessName(request.name())
            .slug(request.slug())
            .email(request.email())
            .phone(request.phone())
            .address(request.address())
            .status(Tenant.TenantStatus.ACTIVE)
            .plan(Tenant.SubscriptionPlan.valueOf(request.plan()))
            .planExpiresAt(LocalDateTime.now().plusMonths(1))
            .build();
        Tenant saved = tenantRepository.save(tenant);

        // Crear un usuario TENANT_ADMIN asociado al tenant
        String firstName = request.firstName() != null ? request.firstName() : "";
        String lastName = request.lastName() != null ? request.lastName() : "";
        String phone = request.phone() != null ? request.phone() : "";
        String digits = phone.replaceAll("\\D", "");
        String last4 = digits.length() >= 4 ? digits.substring(digits.length() - 4) : (digits.isEmpty() ? "0000" : digits);
        String base = (firstName + "-" + lastName).trim().toLowerCase().replaceAll("\\s+", "-");
        if (base.isEmpty()) base = saved.getBusinessName() != null ? saved.getBusinessName().toLowerCase().replaceAll("\\s+", "-") : "user";
        String rawPassword = base + "-" + last4;

        User user = User.builder()
            .tenantId(saved.getId())
            .email(request.email() != null ? request.email().toLowerCase() : null)
            .passwordHash(passwordEncoder.encode(rawPassword))
            .firstName(firstName.isEmpty() ? "" : firstName)
            .lastName(lastName.isEmpty() ? "" : lastName)
            .phone(phone)
            .role(User.Role.TENANT_ADMIN)
            .active(true)
            .emailVerified(false)
            .build();

        userRepository.save(user);

        return ResponseEntity.ok(toDto(saved));
    }

    @PatchMapping("/tenants/{tenantId}/status")
    public ResponseEntity<TenantDto> updateStatus(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId, @RequestBody TenantStatusRequest request) {
        requireSuperAdmin(currentUser);
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant no encontrado"));
        tenant.setStatus(Tenant.TenantStatus.valueOf(request.status()));
        return ResponseEntity.ok(toDto(tenantRepository.save(tenant)));
    }

    @DeleteMapping("/tenants/{tenantId}")
    public ResponseEntity<Void> deleteTenant(@AuthenticationPrincipal User currentUser, @PathVariable UUID tenantId) {
        requireSuperAdmin(currentUser);
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant no encontrado"));
        tenantRepository.delete(tenant);
        return ResponseEntity.noContent().build();
    }

    private TenantDto toDto(Tenant tenant) {
        return new TenantDto(
            tenant.getId().toString(),
            tenant.getBusinessName(),
            tenant.getSlug(),
            tenant.getEmail(),
            tenant.getPhone(),
            tenant.getAddress(),
            tenant.getStatus().name(),
            tenant.getPlan().name(),
            tenant.getCreatedAt() == null ? null : tenant.getCreatedAt().toString()
        );
    }

    public record GlobalOverviewDto(
        long totalTenants,
        long activeTenants,
        long totalAppointments,
        double totalRevenue,
        double monthlyGrowth,
        PlanDistributionDto activePlans
    ) {}

    public record PlanDistributionDto(long basic, long professional, long premium) {}

    public record TenantDto(
        String id,
        String name,
        String slug,
        String email,
        String phone,
        String address,
        String status,
        String plan,
        String createdAt
    ) {}

    public record TenantCreateRequest(
        String name,
        String firstName,
        String lastName,
        String slug,
        String email,
        String phone,
        String address,
        String plan
    ) {}

    public record TenantStatusRequest(String status) {}

    private void requireSuperAdmin(User currentUser) {
        if (currentUser == null || currentUser.getRole() != User.Role.SUPER_ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("No autorizado");
        }
    }
}
