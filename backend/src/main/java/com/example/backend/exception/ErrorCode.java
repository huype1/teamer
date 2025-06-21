package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    UNAUTHORIZED(HttpStatus.FORBIDDEN, 1, "You are not allowed to access this api"),
    UNCAGETORIZED_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, 2, "Unknown error"),
    INVALID_KEY(HttpStatus.BAD_REQUEST, 3, "Invalid token"),
    USERNAME_INVALID(HttpStatus.BAD_REQUEST, 4, "Username must be at least {min} character"),
    PASSWORD_INVALID(HttpStatus.BAD_REQUEST, 5, "Password must be at least {min} characters"),
    USER_EXISTED(HttpStatus.BAD_REQUEST, 6, "User existed"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, 7, "Invalid credentials"),
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, 8, "Rate limit exceeded"),
    NOT_FOUND(HttpStatus.NOT_FOUND, 9, "Cannot find the resource"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, 10, "Cannot find user information");

    HttpStatusCode httpStatusCode;
    int code;
    String message;
}
