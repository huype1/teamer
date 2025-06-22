package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationRequest {
    private UUID projectId;
    private String email;
    private String role = "MEMBER"; // ADMIN, PM, MEMBER, VIEWER
}
