package com.example.backend.repository;

import com.example.backend.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    // For pagination support
    Page<Message> findByChatIdOrderByCreatedAtDesc(UUID chatId, Pageable pageable);
    
    // For chat app - newest messages at bottom
    List<Message> findByChatIdOrderByCreatedAtAsc(UUID chatId);
    
    // Count messages in a chat
    long countByChatId(UUID chatId);
}
