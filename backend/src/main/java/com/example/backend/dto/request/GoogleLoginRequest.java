package com.example.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class GoogleLoginRequest {
    String idToken;
    String email;
    String name;
    String picture;
}
