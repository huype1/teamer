package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.example.backend.dto.request.UserUpdateRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.dto.response.UserMinimalResponse;
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
    public ApiResponse<List<UserResponse>> getUsers(@RequestParam(required = false) String search) {
        log.info("Fetching users with search: {}", search);
        List<UserResponse> users = search != null && !search.trim().isEmpty() 
            ? userService.searchUsers(search) 
            : userService.getUsers();
        return ApiResponse.<List<UserResponse>>builder()
                .message("List of users fetched successfully")
                .result(users)
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
    public ApiResponse<UserResponse> updateMyInfo(@RequestBody @Valid UserUpdateRequest request) {
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
        log.info("Fetching user detailed info with ID: {}", userId);
        return ApiResponse.<UserResponse>builder()
                .message("User detailed info fetched successfully")
                .result(userService.getUser(userId))
                .build();
    }

    @GetMapping("/{userId}/minimal")
    public ApiResponse<UserMinimalResponse> getUserMinimalById(@PathVariable("userId") UUID userId) {
        log.info("Fetching user minimal info with ID: {}", userId);
        return ApiResponse.<UserMinimalResponse>builder()
                .message("User minimal info fetched successfully")
                .result(userService.getUserMinimal(userId))
                .build();
    }
}
