package com.example.backend.service;


import com.example.backend.entity.Invitation;
import com.example.backend.entity.Project;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.InvitationRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.UserRepository;
import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvitationService {

    ProjectRepository projectRepository;
    InvitationRepository invitationRepository;
    EmailService emailService;
    UserRepository userRepository;

    public void sendInvitation(String email, UUID projectId, String role) throws AppException, MessagingException {
        Invitation invitation = new Invitation();

        invitation.setEmail(email);
        invitation.setRole(role);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> {
                    log.error("Project not found for id: {}", projectId);
                    return new AppException(ErrorCode.NOT_FOUND);
                });
        invitation.setProject(project);

        Invitation result = invitationRepository.save(invitation);

        String invitationLink = "http://localhost:5173/invitation/accept_invitation?token=" + result.getId();
        emailService.sendEmailWithToken(email, invitationLink);

    }

    public Invitation acceptInvitation(UUID token) {
        Invitation invitation = invitationRepository.findById(token)
                .orElseThrow(() -> {
                    log.error("Invitation not found for token: {}", token);
                    return new AppException(ErrorCode.NOT_FOUND);
                });

        if (invitation.getExpirationDate().isBefore(LocalDate.now())) {
            log.warn("Invitation expired: {}", token);
            throw new AppException(ErrorCode.EXPIRED);
        }

        invitation.setStatus("ACCEPTED");

        return invitationRepository.save(invitation);
    }

    public UUID getTokenByUserEmail(String email) {
        Invitation invitation = invitationRepository.findByEmail(email);
        return invitation.getId();
    }

    public void deleteInvitation(UUID invitationId) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> {
                    log.error("Invitation not found for id: {}", invitationId);
                    return new AppException(ErrorCode.NOT_FOUND);
                });

        invitationRepository.delete(invitation);
    }

}
