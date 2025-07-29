package com.example.backend.repository;

import com.example.backend.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {
    // Basic CRUD operations are provided by JpaRepository
    // Add custom query methods if needed
}
