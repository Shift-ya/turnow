package com.turnow.domain.user.repository;

import com.turnow.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByTenantId(UUID tenantId);

    Page<User> findByTenantIdAndRole(UUID tenantId, User.Role role, Pageable pageable);

    List<User> findByTenantIdAndActive(UUID tenantId, Boolean active);

    @Query("SELECT COUNT(u) FROM User u WHERE u.tenantId = :tenantId AND u.role = :role")
    long countByTenantIdAndRole(@Param("tenantId") UUID tenantId, @Param("role") User.Role role);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :loginAt WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") UUID userId, @Param("loginAt") LocalDateTime loginAt);
}
