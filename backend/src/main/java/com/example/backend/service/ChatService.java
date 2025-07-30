package com.example.backend.service;

import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.dto.request.AttachmentMeta;
import com.example.backend.dto.response.ChatMessageResponse;
import com.example.backend.entity.Chat;
import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ChatMessageMapper;
import com.example.backend.repository.ChatRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatService {
    
    ChatRepository chatRepository;
    MessageRepository messageRepository;
    UserRepository userRepository;
    ChatMessageMapper chatMessageMapper;
    WebSocketService webSocketService;
    MessageService messageService;
    
    /**
     * Create a new chat with name
     */
    public Chat createChat(String name) {
        Chat chat = Chat.builder()
                .name(name)
                .build();
        
        Chat savedChat = chatRepository.save(chat);
        log.info("Created chat with id: {}", savedChat.getId());
        return savedChat;
    }
    
    /**
     * Create a new chat with Chat object (used by ProjectService)
     */
    public Chat createChat(Chat chat) {
        Chat savedChat = chatRepository.save(chat);
        log.info("Created chat with id: {}", savedChat.getId());
        return savedChat;
    }
    
    /**
     * Get chat by ID
     */
    public Chat getChatById(UUID id) throws AppException {
        return chatRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Chat not found for id: {}", id);
                    return new AppException(ErrorCode.NOT_FOUND);
                });
    }
    
    /**
     * Get all chats
     */
    public List<Chat> getAllChats() {
        return chatRepository.findAll();
    }
    
    /**
     * Create a new message in a chat
     */
    public ChatMessageResponse createMessage(ChatMessageRequest request, UUID userId) throws AppException {
        // Validate chat exists
        Chat chat = getChatById(request.getChatId());
        
        // Validate user exists
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        
        // Create message using MessageService (which handles attachments)
        Message savedMessage = messageService.sendMessage(userId, request.getChatId(), request.getContent(), request.getAttachments());
        log.info("Created message with id: {} in chat: {}", savedMessage.getId(), chat.getId());
        
        // Broadcast message via WebSocket
        log.info("Broadcasting message via WebSocket for messageId: {}", savedMessage.getId());
        webSocketService.broadcastChatMessageCreated(savedMessage);
        log.info("WebSocket broadcast completed for messageId: {}", savedMessage.getId());
        
        return chatMessageMapper.toResponse(savedMessage);
    }
    
    /**
     * Get messages for a chat with pagination (for future use)
     */
    public Page<ChatMessageResponse> getChatMessages(UUID chatId, int page, int size) throws AppException {
        // Validate chat exists
        getChatById(chatId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
        
        return messages.map(chatMessageMapper::toResponse);
    }
    
    /**
     * Get all messages for a chat (for smaller chats) - newest at bottom for chat app
     */
    public List<ChatMessageResponse> getAllChatMessages(UUID chatId) throws AppException {
        // Validate chat exists
        getChatById(chatId);
        
        // Use ascending order so newest messages appear at bottom
        List<Message> messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
        return chatMessageMapper.toResponseList(messages);
    }
    
    /**
     * Delete a message
     */
    public void deleteMessage(UUID messageId, UUID userId) throws AppException {
        Optional<Message> message = messageRepository.findById(messageId);
        Optional<User> user = userRepository.findById(userId);

        if (message.isEmpty() || user.isEmpty()) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        // Only allow message sender to delete their own message
        if (!message.get().getSender().getId().equals(userId)) {
            log.error("User {} attempted to delete message {} they didn't send", userId, messageId);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        UUID chatId = message.get().getChat().getId();
        messageRepository.delete(message.get());
        log.info("Deleted message with id: {} from chat: {}", messageId, chatId);
        
        // Broadcast message deletion via WebSocket
        webSocketService.broadcastChatMessageDeleted(messageId, chatId);
    }
    
    /**
     * Get message count for a chat
     */
    public long getChatMessageCount(UUID chatId) throws AppException {
        // Validate chat exists
        getChatById(chatId);
        return messageRepository.countByChatId(chatId);
    }
}
