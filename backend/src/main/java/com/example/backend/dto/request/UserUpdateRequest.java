package com.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    
    @NotNull(message = "Name is required")
    @Size(min = 2, message = "Name must not be less than 2 characters")
    String name;
    
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    String bio;
    
    @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
    String avatarUrl;
}
