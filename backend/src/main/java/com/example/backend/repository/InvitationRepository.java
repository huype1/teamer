package com.example.backend.repository;

import com.example.backend.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {
    Invitation findByEmail(String email);
}
