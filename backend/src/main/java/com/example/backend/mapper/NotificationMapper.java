package com.example.backend.mapper;

import com.example.backend.dto.response.NotificationRecipientResponse;
import com.example.backend.dto.response.NotificationResponse;
import com.example.backend.entity.Notification;
import com.example.backend.entity.NotificationRecipient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationMapper INSTANCE = Mappers.getMapper(NotificationMapper.class);

    // Map từ Notification entity sang NotificationResponse
    @Mapping(target = "isRead", ignore = true)
    @Mapping(target = "isEmailSent", ignore = true)
    NotificationResponse toResponse(Notification notification);

    // Map từ NotificationRecipient entity sang NotificationRecipientResponse
    @Mapping(target = "id", source = "id")
    @Mapping(target = "notificationId", source = "notification.id")
    @Mapping(target = "title", source = "notification.title")
    @Mapping(target = "content", source = "notification.content")
    @Mapping(target = "link", source = "notification.link")
    @Mapping(target = "type", source = "notification.type")
    @Mapping(target = "entityType", source = "notification.entityType")
    @Mapping(target = "entityId", source = "notification.entityId")
    @Mapping(target = "priority", source = "notification.priority")
    @Mapping(target = "createdBy", source = "notification.createdBy")
    @Mapping(target = "createdAt", source = "notification.createdAt")
    @Mapping(target = "updatedAt", source = "notification.updatedAt")
    @Mapping(target = "isRead", source = "isRead")
    @Mapping(target = "isEmailSent", source = "isEmailSent")
    NotificationRecipientResponse toRecipientResponse(NotificationRecipient recipient);

    List<NotificationResponse> toResponseList(List<Notification> notifications);
    List<NotificationRecipientResponse> toRecipientResponseList(List<NotificationRecipient> recipients);
} 