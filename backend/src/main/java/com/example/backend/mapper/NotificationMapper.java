package com.example.backend.mapper;

import com.example.backend.dto.response.NotificationResponse;
import com.example.backend.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationMapper INSTANCE = Mappers.getMapper(NotificationMapper.class);

    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "isRead", source = "isRead")
    @Mapping(target = "isEmailSent", source = "isEmailSent")
    NotificationResponse toResponse(Notification notification);

    List<NotificationResponse> toResponseList(List<Notification> notifications);
} 