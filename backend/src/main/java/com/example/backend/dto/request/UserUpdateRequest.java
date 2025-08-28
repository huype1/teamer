package com.example.backend.dto.request;

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
    
    @Size(min = 2, message = "Name must not be less than 2 characters")
    String name;
    
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    String bio;
    
    String avatarUrl;
}
