package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

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
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getMyInfo());
        return apiResponse;
    }
}
