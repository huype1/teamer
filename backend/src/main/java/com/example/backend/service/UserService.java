package com.example.backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.backend.utils.JwtUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.request.UserCreationRequest;
import com.example.backend.dto.request.UserUpdateRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.dto.response.ProjectMemberResponse;
import com.example.backend.dto.response.TeamMemberResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.TeamMemberRepository;
import com.example.backend.repository.ProjectMemberRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserRepository userRepository;
    TeamMemberRepository teamMemberRepository;
    ProjectMemberRepository projectMemberRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (request.getAvatarUrl() == null || request.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(
                    "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=");
        }

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            log.error("User creation failed due to data integrity violation: {}", ex.getMessage());
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo() {
        UUID userId = JwtUtils.getSubjectFromJwt();
        return getMyInfoOptimized(userId);
    }

    public UserResponse updateMyInfo(UserUpdateRequest request) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        return updateUser(userId, request);
    }

    public void deleteMyAccount() {
        UUID userId = JwtUtils.getSubjectFromJwt();
        userRepository.deleteById(userId);
    }
    
    private UserResponse getMyInfoOptimized(UUID userId) {
        long startTime = System.currentTimeMillis();
        
        // Fetch user cơ bản
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        log.info("Fetch user took: {}ms", System.currentTimeMillis() - startTime);
        
        long teamStart = System.currentTimeMillis();
        // Fetch team memberships tối ưu - chỉ select những field cần thiết
        var teamMemberData = teamMemberRepository.findMinimalByUserId(userId);
        log.info("Fetch team memberships took: {}ms", System.currentTimeMillis() - teamStart);
        
        long projectStart = System.currentTimeMillis();
        // Fetch project members tối ưu - chỉ select những field cần thiết
        var projectMemberData = projectMemberRepository.findMinimalByUserId(userId);
        log.info("Fetch project members took: {}ms", System.currentTimeMillis() - projectStart);
        
        // Map data tối ưu
        List<TeamMemberResponse> teamMembers = teamMemberData.stream()
                .map(data -> TeamMemberResponse.builder()
                        .teamId((UUID) data[0])
                        .userId((UUID) data[1])
                        .role((String) data[2])
                        .joinedAt((OffsetDateTime) data[3])
                        .build())
                .toList();
                
        List<ProjectMemberResponse> projectMembers = projectMemberData.stream()
                .map(data -> ProjectMemberResponse.builder()
                        .projectId((UUID) data[0])
                        .userId((UUID) data[1])
                        .role((String) data[2])
                        .joinedAt((OffsetDateTime) data[3])
                         .build())
                .toList();
        
        // Tạo response tối ưu
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .provider(user.getProvider())
                .teamMembers(teamMembers)
                .projectMembers(projectMembers)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
        
        log.info("Total getMyInfoOptimized took: {}ms", System.currentTimeMillis() - startTime);
        return response;
    }
    

    private User getUserWithMemberships(UUID userId) {
        // Fetch user cơ bản
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Fetch team memberships tối ưu
        var teamMemberships = teamMemberRepository.findByUserIdWithTeam(userId);
        user.setTeamMemberships(teamMemberships);
        
        // Fetch project members tối ưu
        var projectMembers = projectMemberRepository.findByUserIdWithProject(userId);
        user.setProjectMembers(projectMembers);
        
        return user;
    }

    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        userMapper.updateUser(user, request);
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse getUser(UUID id) {
        return userMapper.toUserResponse(getUserWithMemberships(id));
    }

    public List<UserResponse> getUsersByEmail(String email) {
        return userRepository.findByEmail(email).stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    public void deleteUser(UUID userId) {
        userRepository.deleteById(userId);
    }

    public User getUserEntity(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
    }
}
