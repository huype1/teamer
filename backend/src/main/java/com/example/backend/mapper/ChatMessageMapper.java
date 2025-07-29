package com.example.backend.mapper;

import com.example.backend.dto.response.ChatMessageResponse;
import com.example.backend.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    
    ChatMessageMapper INSTANCE = Mappers.getMapper(ChatMessageMapper.class);
    
    @Mapping(source = "sender", target = "sender")
    @Mapping(source = "chat.id", target = "chatId")
    ChatMessageResponse toResponse(Message message);
    
    List<ChatMessageResponse> toResponseList(List<Message> messages);
} 