package com.example.backend.service;

import com.example.backend.dto.request.IssueRequest;
import com.example.backend.entity.Comment;
import com.example.backend.entity.Issue;
import com.example.backend.entity.Project;
import com.example.backend.entity.ProjectMember;
import com.example.backend.entity.Sprint;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.IssueRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.ProjectMemberRepository;
import com.example.backend.repository.SprintRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IssueService {

    IssueRepository issueRepository;
    UserService userService;
    ProjectRepository projectRepository;
    ProjectMemberRepository projectMemberRepository;
    SprintRepository sprintRepository;
    CommentRepository commentRepository;
    NotificationService notificationService;

    public Issue getIssueById(UUID id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Issue not found for id: {}", id);
                    return new AppException(ErrorCode.NOT_FOUND);
                });
    }

    public List<Issue> getIssuesByProjectId(UUID projectId) {
        return issueRepository.findByProjectIdWithAssigneeAndReporter(projectId);
    }

    public Issue createIssue(IssueRequest issueRequest, UUID projectId, UUID reporterId) {
        try {
            // Validate project exists and user has access
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            User reporter = userService.getUserEntity(reporterId);
            
            // Check if user is project member
            if (!isUserProjectMember(projectId, reporterId)) {
                log.error("User {} is not a member of project {}", reporterId, projectId);
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            Issue issue = new Issue();
            issue.setTitle(issueRequest.getTitle());
            issue.setDescription(issueRequest.getDescription());
            issue.setPriority(issueRequest.getPriority() != null ? issueRequest.getPriority() : "P5");
            issue.setStatus(issueRequest.getStatus() != null ? issueRequest.getStatus() : "TO_DO");
            issue.setIssueType(issueRequest.getIssueType() != null ? issueRequest.getIssueType() : "TASK");
            issue.setStartDate(issueRequest.getStartDate());
            issue.setDueDate(issueRequest.getDueDate());
            issue.setStoryPoints(issueRequest.getStoryPoints());
            issue.setReporter(reporter);
            issue.setProject(project);
            
            // Handle parent issue for subtasks
            if (issueRequest.getParentId() != null) {
                Issue parentIssue = getIssueById(issueRequest.getParentId());
                // Validate that parent issue belongs to the same project
                if (!parentIssue.getProject().getId().equals(projectId)) {
                    log.error("Parent issue {} does not belong to project {}", issueRequest.getParentId(), projectId);
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }
                issue.setParent(parentIssue);
            }
            
            if (issueRequest.getAssigneeId() != null) {
                User assignee = userService.getUserEntity(issueRequest.getAssigneeId());
                issue.setAssignee(assignee);
            }
//            Comment comment = commentRepository.save(new Comment());
//            issue.setComments(comment);

            // Generate issue key (PROJECT-KEY-ISSUE-NUMBER)
            String issueKey = generateIssueKey(project);
            issue.setKey(issueKey);

            return issueRepository.save(issue);
        } catch (Exception e) {
            log.error("Error creating issue: {}", e.getMessage());
            throw new AppException(ErrorCode.CREATION_FAILED);
        }
    }

    public void deleteIssue(UUID id, UUID userId) {
        Issue issue = getIssueById(id);
        
        // Check if user is project admin or the issue reporter
        if (!isUserProjectManager(issue.getProject().getId(), userId) &&
            !issue.getReporter().getId().equals(userId)) {
            log.error("User {} is not authorized to delete issue {}", userId, id);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        issueRepository.deleteById(id);
        log.info("Issue {} deleted by user {}", id, userId);
    }

    public Issue setAssignee(UUID issueId, UUID assigneeId, UUID userId) {
        Issue issue = getIssueById(issueId);
        
        // Check if user is project member
        if (!isUserProjectMember(issue.getProject().getId(), userId)) {
            log.error("User {} is not a member of project {}", userId, issue.getProject().getId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        User assignee = userService.getUserEntity(assigneeId);
        issue.setAssignee(assignee);
        Issue savedIssue = issueRepository.save(issue);
        
        // Gửi notification cho assignee
        if (assigneeId != null) {
            notificationService.notifyIssueAssigned(
                assigneeId, 
                issue.getTitle(), 
                issue.getId(), 
                issue.getProject().getName()
            );
        }
        
        return savedIssue;
    }

    public Issue unassignIssue(UUID issueId, UUID userId) {
        Issue issue = getIssueById(issueId);
        
        // Check if user is project member
        if (!isUserProjectMember(issue.getProject().getId(), userId)) {
            log.error("User {} is not a member of project {}", userId, issue.getProject().getId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        issue.setAssignee(null);
        return issueRepository.save(issue);
    }

    public Issue updateIssue(UUID id, IssueRequest issueRequest, UUID userId) {
        Issue issue = getIssueById(id);
        
        // Check if user is project member
        if (!isUserProjectMember(issue.getProject().getId(), userId)) {
            log.error("User {} is not a member of project {}", userId, issue.getProject().getId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        if (issueRequest.getTitle() != null) {
            issue.setTitle(issueRequest.getTitle());
        }
        if (issueRequest.getDescription() != null) {
            issue.setDescription(issueRequest.getDescription());
        }
        if (issueRequest.getStatus() != null) {
            issue.setStatus(issueRequest.getStatus());
        }
        if (issueRequest.getPriority() != null) {
            issue.setPriority(issueRequest.getPriority());
        }
        if (issueRequest.getIssueType() != null) {
            issue.setIssueType(issueRequest.getIssueType());
        }
        if (issueRequest.getStartDate() != null) {
            issue.setStartDate(issueRequest.getStartDate());
        }
        if (issueRequest.getDueDate() != null) {
            issue.setDueDate(issueRequest.getDueDate());
        }
        if (issueRequest.getStoryPoints() != null) {
            issue.setStoryPoints(issueRequest.getStoryPoints());
        }
        if (issueRequest.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(issueRequest.getSprintId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            issue.setSprint(sprint);
        } else {
            issue.setSprint(null);
        }
        
        // Handle parent issue for subtasks
        if (issueRequest.getParentId() != null) {
            Issue parentIssue = getIssueById(issueRequest.getParentId());
            // Validate that parent issue belongs to the same project
            if (!parentIssue.getProject().getId().equals(issue.getProject().getId())) {
                log.error("Parent issue {} does not belong to project {}", issueRequest.getParentId(), issue.getProject().getId());
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
            issue.setParent(parentIssue);
        } else if (issueRequest.getParentId() == null && issue.getParent() != null) {
            // Remove parent relationship
            issue.setParent(null);
        }
        
        return issueRepository.save(issue);
    }

    public Issue updateIssueStatus(UUID id, String status, UUID userId) {
        Issue issue = getIssueById(id);
        
        // Check if user is project member
        if (!isUserProjectMember(issue.getProject().getId(), userId)) {
            log.error("User {} is not a member of project {}", userId, issue.getProject().getId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        String oldStatus = issue.getStatus();
        issue.setStatus(status);
        Issue savedIssue = issueRepository.save(issue);
        
        // Gửi notification cho assignee nếu có
        if (issue.getAssignee() != null) {
            notificationService.notifyIssueStatusChanged(
                issue.getAssignee().getId(),
                issue.getTitle(),
                oldStatus,
                status,
                issue.getId()
            );
        }
        
        return savedIssue;
    }

    public List<Issue> getIssuesByAssigneeId(UUID userId) {
        return issueRepository.findByAssigneeId(userId);
    }

    public List<Issue> getSubtasksByIssueId(UUID issueId) {
        Issue parentIssue = getIssueById(issueId);
        return parentIssue.getSubtasks();
    }

    private String generateIssueKey(Project project) {
        // Get the next issue number for this project by finding the highest existing number
        Optional<Integer> maxNumber = issueRepository.findMaxIssueNumberByProject(project.getId(), project.getKey());
        int nextNumber = maxNumber.orElse(0) + 1;
        return project.getKey() + "-" + nextNumber;
    }

    // Helper methods to replace ProjectService dependencies
    private boolean isUserProjectMember(UUID projectId, UUID userId) {
        // Check if user is project creator
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project != null && project.getCreator().getId().equals(userId)) {
            return true;
        }
        
        // Check if user is project member
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    private boolean isUserProjectManager(UUID projectId, UUID userId) {
        // Check if user is project creator
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project != null && project.getCreator().getId().equals(userId)) {
            return true;
        }
        
        // Check if user is project member with ADMIN or PM role
        Optional<ProjectMember> member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
        return member.isPresent() && ("ADMIN".equals(member.get().getRole()) || "PM".equals(member.get().getRole()));
    }
}
