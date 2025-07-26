package com.example.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    @MessageMapping("/comment/join")
    @SendTo("/topic/comment/joined")
    public String handleJoin(String message) {
        log.info("User joined comment room: {}", message);
        return "User joined: " + message;
    }

    @MessageMapping("/comment/leave")
    @SendTo("/topic/comment/left")
    public String handleLeave(String message) {
        log.info("User left comment room: {}", message);
        return "User left: " + message;
    }
} 