package com.example.backend.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUpdateRequest {
    
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    private JsonNode content;
}