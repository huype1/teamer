package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.response.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class HealthController {

    @GetMapping("/")
    public ApiResponse<String> healthCheck() {
        log.info("Health check endpoint called");
        return ApiResponse.<String>builder()
                .message("Teamer API is running!")
                .result("OK - Visit /health for status or /auth for authentication endpoints")
                .build();
    }

    @GetMapping("/health")
    public ApiResponse<String> health() {
        log.info("Health endpoint called");
        return ApiResponse.<String>builder()
                .message("Service is healthy")
                .result("UP")
                .build();
    }
} 