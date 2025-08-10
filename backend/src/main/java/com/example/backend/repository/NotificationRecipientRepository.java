package com.example.backend.repository;

import com.example.backend.entity.NotificationRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, UUID> {

    List<NotificationRecipient> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    List<NotificationRecipient> findByUser_IdAndIsReadOrderByCreatedAtDesc(UUID userId, Boolean isRead);

    @Query("SELECT COUNT(nr) FROM NotificationRecipient nr WHERE nr.user.id = :userId AND nr.isRead = false")
    Long countUnreadByUserId(@Param("userId") UUID userId);

    @Transactional
    @Modifying
    @Query("UPDATE NotificationRecipient nr SET nr.isRead = true WHERE nr.user.id = :userId")
    void markAllAsReadByUserId(@Param("userId") UUID userId);

    @Transactional
    @Modifying
    @Query("UPDATE NotificationRecipient nr SET nr.isRead = true WHERE nr.id = :id AND nr.user.id = :userId")
    void markAsReadByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Transactional
    @Modifying
    @Query("UPDATE NotificationRecipient nr SET nr.isEmailSent = true WHERE nr.id = :id")
    void markEmailAsSent(@Param("id") UUID id);

    // Use Pageable instead of LIMIT in JPQL
    // Example usage: repository.findByUser_IdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit))

    @Query("SELECT nr FROM NotificationRecipient nr WHERE nr.notification.id = :notificationId")
    List<NotificationRecipient> findByNotificationId(@Param("notificationId") UUID notificationId);

    @Query("SELECT nr FROM NotificationRecipient nr WHERE nr.user.id = :userId AND nr.notification.entityType = :entityType AND nr.notification.entityId = :entityId")
    List<NotificationRecipient> findByUserIdAndEntity(@Param("userId") UUID userId, @Param("entityType") String entityType, @Param("entityId") UUID entityId);
} 