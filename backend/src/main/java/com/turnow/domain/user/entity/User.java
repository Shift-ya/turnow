package com.turnow.domain.user.entity;

import com.turnow.domain.tenant.entity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Usuario del sistema.
 * Implementa UserDetails para integración con Spring Security.
 *
 * Un usuario SUPER_ADMIN no tiene tenant_id (es null).
 * Todos los demás roles DEBEN tener tenant_id.
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_tenant_id", columnList = "tenant_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * tenant_id es NULL para SUPER_ADMIN.
     * Es OBLIGATORIO para TENANT_ADMIN, STAFF, CLIENT.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", foreignKey = @ForeignKey(name = "fk_users_tenant_id"))
    private Tenant tenant;

    @Column(name = "tenant_id", insertable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "phone", length = 50)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ─── Enum de Roles ────────────────────────────────────────────────────────

    public enum Role {
        SUPER_ADMIN,
        TENANT_ADMIN,
        STAFF,
        CLIENT
    }

    // ─── Métodos de negocio ──────────────────────────────────────────────────

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isSuperAdmin() {
        return role == Role.SUPER_ADMIN;
    }

    public boolean belongsToTenant(UUID tenantId) {
        return this.tenantId != null && this.tenantId.equals(tenantId);
    }

    // ─── UserDetails (Spring Security) ──────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
