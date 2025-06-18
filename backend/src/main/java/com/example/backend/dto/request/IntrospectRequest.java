package com.example.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class IntrospectRequest {
    String token;
}
