package com.example.backend.controller;

import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ChatMessageResponse;
import com.example.backend.entity.Chat;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.service.ChatService;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.JwtUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatController {
    
    ChatService chatService;
    UserRepository userRepository;
    
    /**
     * Create a new chat
     */
    @PostMapping
    public ApiResponse<Chat> createChat(@RequestParam String name) {
        log.info("Creating chat with name: {}", name);
        return ApiResponse.<Chat>builder()
                .message("Chat created successfully")
                .result(chatService.createChat(name))
                .build();
    }
    
    /**
     * Get all chats
     */
    @GetMapping
    public ApiResponse<List<Chat>> getAllChats() {
        log.info("Getting all chats");
        return ApiResponse.<List<Chat>>builder()
                .message("Chats fetched successfully")
                .result(chatService.getAllChats())
                .build();
    }
    
    /**
     * Get chat by ID
     */
    @GetMapping("/{chatId}")
    public ApiResponse<Chat> getChatById(@PathVariable UUID chatId) throws AppException {
        log.info("Getting chat with ID: {}", chatId);
        return ApiResponse.<Chat>builder()
                .message("Chat fetched successfully")
                .result(chatService.getChatById(chatId))
                .build();
    }
    
    /**
     * Create a new message in a chat
     */
    @PostMapping("/messages")
    public ApiResponse<ChatMessageResponse> createMessage(@Valid @RequestBody ChatMessageRequest request) throws AppException {
        log.info("Creating message in chat with ID: {}", request.getChatId());
        UUID userId = JwtUtils.getSubjectFromJwt();
        ChatMessageResponse message = chatService.createMessage(request, userId);
        
        return ApiResponse.<ChatMessageResponse>builder()
                .message("Message created successfully")
                .result(message)
                .build();
    }
    
    /**
     * Get messages for a chat with pagination
     */
    @GetMapping("/{chatId}/messages")
    public ApiResponse<Page<ChatMessageResponse>> getChatMessages(
            @PathVariable UUID chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws AppException {
        log.info("Getting messages for chat with ID: {}, page: {}, size: {}", chatId, page, size);
        return ApiResponse.<Page<ChatMessageResponse>>builder()
                .message("Messages fetched successfully")
                .result(chatService.getChatMessages(chatId, page, size))
                .build();
    }
    
    /**
     * Get all messages for a chat
     */
    @GetMapping("/{chatId}/messages/all")
    public ApiResponse<List<ChatMessageResponse>> getAllChatMessages(@PathVariable UUID chatId) throws AppException {
        log.info("Getting all messages for chat with ID: {}", chatId);
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .message("All messages fetched successfully")
                .result(chatService.getAllChatMessages(chatId))
                .build();
    }
    
    /**
     * Delete a message
     */
    @DeleteMapping("/messages/{messageId}")
    public ApiResponse<Void> deleteMessage(@PathVariable UUID messageId) throws AppException {
        log.info("Deleting message with ID: {}", messageId);
        UUID userId = JwtUtils.getSubjectFromJwt();
        chatService.deleteMessage(messageId, userId);
        return ApiResponse.<Void>builder()
                .message("Message deleted successfully")
                .build();
    }
    
    /**
     * Get message count for a chat
     */
    @GetMapping("/{chatId}/messages/count")
    public ApiResponse<Long> getChatMessageCount(@PathVariable UUID chatId) throws AppException {
        log.info("Getting message count for chat with ID: {}", chatId);
        return ApiResponse.<Long>builder()
                .message("Message count fetched successfully")
                .result(chatService.getChatMessageCount(chatId))
                .build();
    }
} 