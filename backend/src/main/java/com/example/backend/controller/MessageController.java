package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.MessageCreationRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entity.Message;
import com.example.backend.service.MessageService;
import com.example.backend.service.UserService;
import com.example.backend.service.ChatService;
import com.example.backend.utils.JwtUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MessageController {

    final MessageService messageService;
    final UserService userService;
    final ChatService chatService;

    @PostMapping("/send")
    public ApiResponse<Message> sendMessage(@RequestBody MessageCreationRequest request) {
        UUID senderId = JwtUtils.getSubjectFromJwt();
        Message message = messageService.sendMessage(senderId, request.getChatId(), request.getContent());
        return ApiResponse.<Message>builder()
                .message("Message sent successfully")
                .result(message)
                .build();
    }

    @GetMapping("/{chatId}")
    public ApiResponse<List<Message>> getMessagesByChatId(@PathVariable UUID chatId) {
        return ApiResponse.<List<Message>>builder()
                .message("Messages fetched successfully")
                .result(messageService.getMessagesByChatId(chatId))
                .build();
    }
}