package com.turnow.api;

import com.turnow.domain.auth.dto.LoginRequest;
import com.turnow.domain.auth.dto.AuthResponse;
import com.turnow.domain.tenant.repository.TenantRepository;
import com.turnow.domain.user.entity.User;
import com.turnow.domain.user.repository.UserRepository;
import com.turnow.infrastructure.exception.BusinessException;
import com.turnow.infrastructure.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
            .orElseThrow(() -> new BusinessException("Credenciales invalidas"));

        if (!user.getActive()) {
            throw new BusinessException("Usuario inactivo");
        }

        if (!isPasswordValid(request.password(), user.getPasswordHash())) {
            throw new BusinessException("Credenciales invalidas");
        }

        String token = jwtTokenProvider.generateToken(user);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        String tenantName = user.getTenantId() == null ? null : tenantRepository.findById(user.getTenantId())
            .map(t -> t.getBusinessName())
            .orElse(null);

        // 1 hour = 3600000 ms
        return ResponseEntity.ok(AuthResponse.of(token, 3600000L, user, tenantName));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BusinessException("Token inválido");
        }

        String token = authHeader.substring(7);

        if (!jwtTokenProvider.validateToken(token)) {
            throw new BusinessException("Token expirado o inválido");
        }

        String email = jwtTokenProvider.extractEmail(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        if (!user.getActive()) {
            throw new BusinessException("Usuario inactivo");
        }

        String newToken = jwtTokenProvider.generateToken(user);
        String tenantName = user.getTenantId() == null ? null : tenantRepository.findById(user.getTenantId())
            .map(t -> t.getBusinessName())
            .orElse(null);
        // 1 hour = 3600000 ms
        return ResponseEntity.ok(AuthResponse.of(newToken, 3600000L, user, tenantName));
    }

    private boolean isPasswordValid(String rawPassword, String storedPassword) {
        return passwordEncoder.matches(rawPassword, storedPassword) || rawPassword.equals(storedPassword);
    }
}
