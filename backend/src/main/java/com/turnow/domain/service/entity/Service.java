package com.turnow.domain.service.entity;

import jakarta.persistence.*;
import com.turnow.domain.tenant.entity.Tenant;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio ofrecido por un negocio.
 * Ej: Corte de cabello, Manicura, Consulta médica, etc.
 */
@Entity
@Table(
    name = "services",
    indexes = {
        @Index(name = "idx_services_tenant_id", columnList = "tenant_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service {

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

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    /** Duración en minutos */
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    /** Precio del servicio */
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    /** Color para mostrar en el calendario */
    @Column(name = "color", length = 7)
    @Builder.Default
    private String color = "#6366f1";

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
