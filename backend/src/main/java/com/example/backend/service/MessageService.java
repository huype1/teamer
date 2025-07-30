package com.example.backend.service;

import com.example.backend.entity.Chat;
import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import com.example.backend.entity.Attachment;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.ChatRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.AttachmentRepository;
import com.example.backend.dto.request.AttachmentMeta;

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
    AttachmentRepository attachmentRepository;
    NotificationService notificationService;

    public Message sendMessage(UUID senderId, UUID chatId, String content, List<AttachmentMeta> attachments) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        Message message = new Message();
        message.setSender(sender);
        message.setChat(chat);
        message.setContent(content);
        message.setCreatedAt(OffsetDateTime.now());
        Message savedMessage = messageRepository.save(message);

        // Save attachments if provided
        if (attachments != null && !attachments.isEmpty()) {
            for (AttachmentMeta meta : attachments) {
                Attachment att = Attachment.builder()
                        .message(savedMessage)
                        .fileName(meta.getFileName())
                        .fileType(meta.getFileType())
                        .fileSize(meta.getFileSize())
                        .filePath(meta.getFilePath())
                        .uploader(sender)
                        .build();
                attachmentRepository.save(att);
            }
        }

        chat.getMessages().add(savedMessage);
        chatRepository.save(chat);

//        // Gửi notification cho các thành viên khác trong chat (trừ người gửi)
//        List<User> chatMembers = chat.getProject().getProjectMembers().stream()
//                .map(projectMember -> projectMember.getUser())
//                .filter(user -> !user.getId().equals(senderId))
//                .toList();
//
//        for (User member : chatMembers) {
//            notificationService.notifyNewChatMessage(
//                member.getId(),
//                sender.getName(),
//                chat.getProject().getName(),
//                chatId
//            );
//        }
//
        return savedMessage;
    }

    public List<Message> getMessagesByChatId(UUID chatId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
    }
}
