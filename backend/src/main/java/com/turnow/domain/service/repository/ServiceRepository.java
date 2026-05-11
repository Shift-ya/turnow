package com.turnow.domain.service.repository;

import com.turnow.domain.service.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {

    List<Service> findByTenantId(UUID tenantId);

    List<Service> findByTenantIdAndActiveTrue(UUID tenantId);

    Optional<Service> findByIdAndTenantId(UUID id, UUID tenantId);

    long countByTenantIdAndActiveTrue(UUID tenantId);
}
