package com.turnow.domain.auth.dto;

import com.turnow.domain.user.entity.User;

import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String tokenType,
    Long expiresIn,
    UUID userId,
    UUID tenantId,
    String tenantName,
    String email,
    String fullName,
    String firstName,
    String lastName,
    User.Role role
) {
    public static AuthResponse of(String token, Long expiresIn, User user, String tenantName) {
        return new AuthResponse(
            token,
            "Bearer",
            expiresIn,
            user.getId(),
            user.getTenantId(),
            tenantName,
            user.getEmail(),
            user.getFullName(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole()
        );
    }
}
