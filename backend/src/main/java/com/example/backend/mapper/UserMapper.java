package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.dto.request.UserCreationRequest;
import com.example.backend.dto.request.UserUpdateRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.User;

@Mapper(componentModel = "spring", uses = {TeamMemberMapper.class, ProjectMemberMapper.class})
public interface UserMapper {
    User toUser(UserCreationRequest request);

    @Mapping(target = "teamMembers", source = "teamMemberships")
    @Mapping(target = "projectMembers", source = "projectMembers")
    UserResponse toUserResponse(User user);

    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
