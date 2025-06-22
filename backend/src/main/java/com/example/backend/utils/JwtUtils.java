package com.example.backend.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;

import java.util.UUID;

public class JwtUtils {

    public static Jwt getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return (Jwt) authentication.getPrincipal();
    }

    public static String getEmailFromJwt() {
        return getCurrentJwt().getClaim("email");
    }

    public static UUID getSubjectFromJwt() {
        String subject = getCurrentJwt().getSubject();
        if (subject == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }
}
