package com.example.backend.service;

import com.example.backend.dto.request.IssueRequest;
import com.example.backend.entity.Comment;
import com.example.backend.entity.Issue;
import com.example.backend.entity.Project;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.IssueRepository;
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
    ProjectService projectService;
    CommentRepository commentRepository;

    public Issue getIssueById(UUID id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Issue not found for id: {}", id);
                    return new AppException(ErrorCode.NOT_FOUND);
                });
    }

    public List<Issue> getIssuesByProjectId(UUID projectId) {
        return issueRepository.findByProjectId(projectId)
                .orElseThrow(() -> {
                    log.error("No issues found for project: {}", projectId);
                    return new AppException(ErrorCode.NOT_FOUND);
                });
    }

    public Issue createIssue(IssueRequest issueRequest, UUID projectId, UUID reporterId) {
        try {
            // Validate project exists and user has access
            Project project = projectService.getProjectById(projectId);
            User reporter = userService.getUserEntity(reporterId);
            
            // Check if user is project member
            if (!projectService.isUserProjectMember(projectId, reporterId)) {
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
        if (!projectService.isUserProjectAdmin(issue.getProject().getId(), userId) && 
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
        if (!projectService.isUserProjectMember(issue.getProject().getId(), userId)) {
            log.error("User {} is not a member of project {}", userId, issue.getProject().getId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        User assignee = userService.getUserEntity(assigneeId);
        issue.setAssignee(assignee);
        return issueRepository.save(issue);
    }

    public Issue updateIssue(UUID id, IssueRequest issueRequest, UUID userId) {
        Issue issue = getIssueById(id);
        
        // Check if user is project member
        if (!projectService.isUserProjectMember(issue.getProject().getId(), userId)) {
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
        
        return issueRepository.save(issue);
    }

    public Issue updateIssueStatus(UUID id, String status, UUID userId) {
        Issue issue = getIssueById(id);
        
        // Check if user is project member
        if (!projectService.isUserProjectMember(issue.getProject().getId(), userId)) {
            log.error("User {} is not a member of project {}", userId, issue.getProject().getId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        issue.setStatus(status);
        return issueRepository.save(issue);
    }

    private String generateIssueKey(Project project) {
        // Get the next issue number for this project
        List<Issue> projectIssues = issueRepository.findByProjectId(project.getId()).orElse(List.of());
        int nextNumber = projectIssues.size() + 1;
        return project.getKey() + "-" + nextNumber;
    }
}
