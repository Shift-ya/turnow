package com.turnow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * turnow - SaaS de Gestión de Turnos Multi-Tenant
 *
 * Arquitectura: Monolito Modular con DDD simplificado
 * Stack: Spring Boot 3 + PostgreSQL + JWT + Flyway
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class turnowApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(turnowApplication.class);
        app.setWebApplicationType(WebApplicationType.SERVLET);
        app.run(args);
    }
}
