package com.example.backend.service;

import com.example.backend.dto.response.ProjectResponse;
import com.example.backend.dto.response.ProjectSimpleResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProjectMapper;
import com.example.backend.repository.ProjectMemberRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.SprintRepository;
import com.example.backend.repository.IssueRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.example.backend.repository.AttachmentRepository;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectService {
    ProjectRepository projectRepository;
    ChatService chatService;
    ProjectMemberRepository projectMemberRepository;
    TeamService teamService;
    ProjectMapper projectMapper;
    SprintRepository sprintRepository;
    AttachmentRepository attachmentRepository;
    IssueRepository issueRepository;

    public Project createProject(Project project, User creator, UUID teamId) throws AppException {
        // Validate project key uniqueness
        if (projectRepository.existsByKey(project.getKey())) {
            log.error("Project key already exists: {}", project.getKey());
            throw new AppException(ErrorCode.PROJECT_KEY_EXISTS);
        }

        Project createdProject = new Project();
        createdProject.setCreator(creator);
        createdProject.setName(project.getName());
        createdProject.setKey(project.getKey());
        createdProject.setDescription(project.getDescription());
        createdProject.setAvatarUrl(project.getAvatarUrl());
        createdProject.setIsPublic(project.getIsPublic());

        Chat chat = new Chat();
        chat.setName("Project Chat - " + project.getName());
        Chat chatProject = chatService.createChat(chat);
        if (teamId != null) {
            Team team = teamService.findById(teamId);
            createdProject.setTeam(team);
        }
        createdProject.setChat(chatProject);

        Project savedProject = projectRepository.save(createdProject);

        ProjectMember projectMember = new ProjectMember();
        projectMember.setProjectId(savedProject.getId());
        projectMember.setUserId(creator.getId());
        projectMember.setRole("ADMIN");
        projectMember.setJoinedAt(OffsetDateTime.now());
        projectMemberRepository.save(projectMember);

        return savedProject;
    }

    public List<Project> getProjectAsMember(UUID userId) throws AppException {
        List<Project> projects = projectRepository.findAllProjectsByUserId(userId);
        return projects;
    }

    public Project getProjectById(UUID id) throws AppException {
        Optional<Project> project = projectRepository.findById(id);
        if (project.isEmpty()) {
            log.error("Project not found for id: {}", id);
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        return project.get();
    }

    @Transactional
    public void deleteProject(UUID projectId) throws AppException {
        Project project = getProjectById(projectId);
        
        // Delete all attachments for this project first
        List<Attachment> attachments = attachmentRepository.findByProjectId(projectId);
        attachmentRepository.deleteAll(attachments);
        
        // Delete all sprints for this project
        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        for (Sprint sprint : sprints) {
            // Move all issues from this sprint back to backlog (set sprint to null)
            List<Issue> sprintIssues = issueRepository.findBySprintId(sprint.getId());
            for (Issue issue : sprintIssues) {
                issue.setSprint(null);
                issueRepository.save(issue);
            }
        }
        sprintRepository.deleteAll(sprints);
        
        // Delete all issues for this project (cascade will handle comments and attachments)
        Optional<List<Issue>> issuesOptional = issueRepository.findByProjectId(projectId);
        if (issuesOptional.isPresent()) {
            List<Issue> issues = issuesOptional.get();
            issueRepository.deleteAll(issues);
        }
        
        // Delete all project members
        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(projectId);
        projectMemberRepository.deleteAll(projectMembers);
        
        // Delete the project (cascade will handle chat)
        projectRepository.deleteById(projectId);
    }

    public Project updateProject(Project updatedProject, UUID id) throws AppException {
        Project project = getProjectById(id);

        if (updatedProject.getName() != null && !updatedProject.getName().isEmpty()) {
            project.setName(updatedProject.getName());
        }
        if (updatedProject.getDescription() != null && !updatedProject.getDescription().isEmpty()) {
            project.setDescription(updatedProject.getDescription());
        }
        if (updatedProject.getKey() != null && !updatedProject.getKey().isEmpty()) {
            project.setKey(updatedProject.getKey());
        }
        if (updatedProject.getClientName() != null) {
            project.setClientName(updatedProject.getClientName());
        }
        if (updatedProject.getStartDate() != null) {
            project.setStartDate(updatedProject.getStartDate());
        }
        if (updatedProject.getEndDate() != null) {
            project.setEndDate(updatedProject.getEndDate());
        }
        project.setAvatarUrl(updatedProject.getAvatarUrl());
        project.setIsPublic(updatedProject.getIsPublic());

        Project savedProject = projectRepository.save(project);

        return savedProject;
    }

    public void addUserToProject(UUID projectId, UUID userId, String role) throws AppException {
        Project project = getProjectById(projectId);
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            log.error("User with id: {} is already a member of project with id: {}", userId, projectId);
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        ProjectMember projectMember = new ProjectMember();
        projectMember.setProjectId(projectId);
        projectMember.setUserId(userId);
        projectMember.setRole(role);
        projectMember.setJoinedAt(OffsetDateTime.now());
        projectMemberRepository.save(projectMember);

        if (project.getTeam() != null) {
            try {
                if (!teamService.isUserTeamMember(project.getTeam().getId(), userId)) {
                    teamService.addMemberToTeam(project.getTeam().getId(), userId, "VIEWER");
                    log.info("Automatically added user {} to team {} when added to project {}",
                            userId, project.getTeam().getId(), projectId);
                }
            } catch (Exception e) {
                log.warn("Failed to automatically add user {} to team {}: {}",
                        userId, project.getTeam().getId(), e.getMessage());
            }
        }

        log.info("User with id: {} added to project with id: {}", userId, projectId);
    }

    public void removeUserFromProject(UUID projectId, UUID userId) throws AppException {
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            log.error("User with id: {} is not a member of project with id: {}", userId, projectId);
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        projectMemberRepository.deleteById(new ProjectMemberId(projectId, userId));
        log.info("User with id: {} removed from project with id: {}", userId, projectId);
    }

    public Chat getChatByProjectId(UUID projectId) throws AppException {
        Project project = getProjectById(projectId);
        Chat chat = project.getChat();

        if (chat == null) {
            log.error("Chat not found for project: {}", projectId);
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        return chat;
    }

    public List<ProjectResponse> searchProjects(String keywords, UUID userId) {
        if (keywords == null || keywords.trim().isEmpty()) {
            List<Project> projects = projectRepository.findAllProjectsByUserId(userId);
            return projectMapper.toResponseList(projects);
        }
        List<Project> projects = projectRepository.findByNameOrKeyContainingIgnoreCase(keywords.trim(), userId);
        return projectMapper.toResponseList(projects);
    }

    @Cacheable(value = "userProjects", key = "#userId")
    public List<ProjectSimpleResponse> searchProjectsSimple(String keywords, UUID userId) {
        if (keywords == null || keywords.trim().isEmpty()) {
            List<Project> projects = projectRepository.findAllProjectsByUserIdSimple(userId);
            return projectMapper.toSimpleResponseList(projects);
        }
        List<Project> projects = projectRepository.findByNameOrKeyContainingIgnoreCase(keywords.trim(), userId);
        return projectMapper.toSimpleResponseList(projects);
    }


    public List<ProjectMember> getProjectMembers(UUID projectId) throws AppException {
        return projectMemberRepository.findByProjectId(projectId);
    }

    public boolean isUserProjectMember(UUID projectId, UUID userId) {
        Project project = getProjectById(projectId);
        if (project.getCreator().getId().equals(userId)) {
            return true;
        }
        Optional<ProjectMember> member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
        if (member.isPresent()) {
            return true;
        }
        if (project.getTeam() != null && teamService.isUserTeamAdmin(project.getTeam().getId(), userId)) {
            return true;
        }
        return false;
    }


    public boolean isUserAdmin(UUID projectId, UUID userId) {
        Project project = getProjectById(projectId);

        if (project.getCreator().getId().equals(userId)) {
            return true;
        }

        Optional<ProjectMember> member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
        if (member.isPresent() && ("ADMIN".equals(member.get().getRole()))) {
            return true;
        }

        if (project.getTeam() != null && teamService.isUserTeamAdmin(project.getTeam().getId(), userId)) {
            return true;
        }

        return false;
    }

    public boolean isUserProjectManager(UUID projectId, UUID userId) {
        Project project = getProjectById(projectId);

        if (project.getCreator().getId().equals(userId)) {
            return true;
        }

        Optional<ProjectMember> member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
        if (member.isPresent() && ("ADMIN".equals(member.get().getRole()) || "PM".equals(member.get().getRole()))) {
            return true;
        }

        if (project.getTeam() != null && teamService.isUserTeamAdmin(project.getTeam().getId(), userId)) {
            return true;
        }

        return false;
    }

    public void updateUserRole(UUID projectId, UUID userId, String newRole) throws AppException {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        member.setRole(newRole);
        projectMemberRepository.save(member);
        log.info("Updated role for user {} in project {} to {}", userId, projectId, newRole);
    }

    public List<Project> getPublicProjects() {
        return projectRepository.findByIsPublicTrue();
    }

    public List<Project> getProjectsByTeam(UUID teamId) {
        return projectRepository.findByTeamId(teamId);
    }

    @Transactional
    public Project addProjectToTeam(UUID projectId, UUID teamId) throws AppException {
        Project project = getProjectById(projectId);
        
        if (project.getTeam() != null) {
            throw new AppException(ErrorCode.ALREADY_EXISTS);
        }
        
        Team team = teamService.getTeamById(teamId);
        project.setTeam(team);
        
        // Add all project members as team viewers
        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(projectId);
        for (ProjectMember projectMember : projectMembers) {
            try {
                if (!teamService.isUserTeamMember(teamId, projectMember.getUserId())) {
                    teamService.addMemberToTeam(teamId, projectMember.getUserId(), "VIEWER");
                    log.info("Added project member {} to team {} as VIEWER", projectMember.getUserId(), teamId);
                }
            } catch (Exception e) {
                log.warn("Failed to add project member {} to team {}: {}", 
                    projectMember.getUserId(), teamId, e.getMessage());
            }
        }
        
        return projectRepository.save(project);
    }

    @Transactional
    public Project removeProjectFromTeam(UUID projectId) throws AppException {
        Project project = getProjectById(projectId);
        
        if (project.getTeam() == null) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        
        project.setTeam(null);
        
        return projectRepository.save(project);
    }

    public long getProjectMemberCount(UUID projectId) {
        return projectMemberRepository.countByProjectId(projectId);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public boolean hasAccessToProject(UUID projectId, UUID userId) throws AppException {
        Project project = getProjectById(projectId);

        if (project.getCreator().getId().equals(userId)) {
            return true;
        }

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            return true;
        }

        if (project.getIsPublic() && project.getTeam() != null) {
            return isUserTeamMember(userId, project.getTeam().getId());
        }

        return false;
    }

    public String getUserProjectRole(UUID projectId, UUID userId) throws AppException {
        Project project = getProjectById(projectId);

        if (project.getCreator().getId().equals(userId)) {
            return "ADMIN";
        }

        Optional<ProjectMember> member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
        if (member.isPresent()) {
            return member.get().getRole();
        }

        if (project.getIsPublic() && project.getTeam() != null && isUserTeamMember(userId, project.getTeam().getId())) {
            return "VIEWER";
        }

        return null;
    }

    private boolean isUserTeamMember(UUID userId, UUID teamId) {
        List<UUID> teamMemberIds = projectMemberRepository.findDistinctUserIdsByTeamId(teamId);
        return teamMemberIds.contains(userId);
    }

    public List<User> getProjectUsers(UUID projectId) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        return members.stream()
                .map(member -> member.getUser())
                .toList();
    }
}
