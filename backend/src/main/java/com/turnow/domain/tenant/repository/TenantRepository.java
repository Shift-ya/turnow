package com.turnow.domain.tenant.repository;

import com.turnow.domain.tenant.entity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    Page<Tenant> findByStatus(Tenant.TenantStatus status, Pageable pageable);

    @Query("""
        SELECT t FROM Tenant t
        WHERE (:search IS NULL OR LOWER(t.businessName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:status IS NULL OR t.status = :status)
        AND (:plan IS NULL OR t.plan = :plan)
    """)
    Page<Tenant> findWithFilters(
        @Param("search") String search,
        @Param("status") Tenant.TenantStatus status,
        @Param("plan") Tenant.SubscriptionPlan plan,
        Pageable pageable
    );

    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.status = :status")
    long countByStatus(@Param("status") Tenant.TenantStatus status);

    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.plan = :plan")
    long countByPlan(@Param("plan") Tenant.SubscriptionPlan plan);
}
