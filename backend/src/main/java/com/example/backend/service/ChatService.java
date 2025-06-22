package com.example.backend.service;


import com.example.backend.entity.Chat;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.ChatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatService {
    ChatRepository chatRepository;

    public Chat createChat(Chat chat) {
        try {
            return chatRepository.save(chat);
        } catch (Exception e) {
            log.error("Error creating chat: {}", e.getMessage());
            throw new AppException(ErrorCode.CREATION_FAILED);
        }
    }
}
