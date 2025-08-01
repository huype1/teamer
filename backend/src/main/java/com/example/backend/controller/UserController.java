package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.UserUpdateRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;

    @GetMapping
    public ApiResponse<List<UserResponse>> getUsers() {
        log.info("Fetching all users");
        return ApiResponse.<List<UserResponse>>builder()
                .message("List of users fetched successfully")
                .result(userService.getUsers())
                .build();
    }

    @DeleteMapping("/delete/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable("userId") UUID userId) {
        log.info("Deleting user with ID: {}", userId);
        userService.deleteUser(userId);
        return ApiResponse.<Void>builder().message("User deleted successfully").build();
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyInfo() {
        log.info("Fetching current user info with memberships");
        return ApiResponse.<UserResponse>builder()
                .message("User info fetched successfully")
                .result(userService.getMyInfo())
                .build();
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> updateMyInfo(@RequestBody UserUpdateRequest request) {
        log.info("Updating current user info");
        return ApiResponse.<UserResponse>builder()
                .message("User info updated successfully")
                .result(userService.updateMyInfo(request))
                .build();
    }

    @DeleteMapping("/me")
    public ApiResponse<Void> deleteMyAccount() {
        log.info("Deleting current user account");
        userService.deleteMyAccount();
        return ApiResponse.<Void>builder().message("Account deleted successfully").build();
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUserById(@PathVariable("userId") UUID userId) {
        log.info("Fetching user with ID: {}", userId);
        return ApiResponse.<UserResponse>builder()
                .message("User fetched successfully")
                .result(userService.getUser(userId))
                .build();
    }
}
