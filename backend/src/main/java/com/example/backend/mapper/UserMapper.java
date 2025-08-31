package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.dto.request.UserCreationRequest;
import com.example.backend.dto.request.UserUpdateRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.dto.response.UserMinimalResponse;

@Mapper(componentModel = "spring", uses = {TeamMemberMapper.class, ProjectMemberMapper.class})
public interface UserMapper {
    User toUser(UserCreationRequest request);

    @Mapping(target = "projectMembers", source = "projectMembers")
    @Mapping(target = "teamMembers", source = "teamMemberships")
    @Mapping(target = "bio", source = "bio")
    UserResponse toUserResponse(User user);

    // Minimal response for better performance
    UserMinimalResponse toUserMinimalResponse(User user);

    default void updateUser(@MappingTarget User user, UserUpdateRequest request) {
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
    }
}
