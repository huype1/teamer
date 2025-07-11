package com.example.backend.service;

import com.example.backend.entity.Chat;
import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.ChatRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.UserRepository;

import org.springframework.stereotype.Service;



import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageService {
    UserRepository userRepository;
    MessageRepository messageRepository;
    ChatRepository chatRepository;

    public Message sendMessage(UUID senderId, UUID chatId, String content) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        Message message = new Message();
        message.setSender(sender);
        message.setChat(chat);
        message.setContent(content);
        message.setCreatedAt(OffsetDateTime.now());
        Message savedMessage = messageRepository.save(message);

        chat.getMessages().add(savedMessage);
        chatRepository.save(chat);

        return savedMessage;
    }

    public List<Message> getMessagesByChatId(UUID chatId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
    }
}
