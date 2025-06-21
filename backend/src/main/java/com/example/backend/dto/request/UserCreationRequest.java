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
public class UserCreationRequest {
    @NotNull
    String email;

    @Size(min = 2, message = "USERNAME_INVALID")
    @NotNull
    String name;

    @Size(min = 5, message = "PASSWORD_INVALID")
    String password;

    String provider;

    String avatarUrl;
}
