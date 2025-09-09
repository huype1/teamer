import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import KanbanBoard from "@/components/project/KanbanBoard";
import sprintService from "@/service/sprintService";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import ProjectService from "@/service/projectService";
import type { Project, ProjectMember } from "@/types/project";
import type { Sprint } from "@/types/sprint";
import { toastError } from "@/utils/toast";
import type { Issue } from '@/types/issue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserRole, isCurrentUserManager } from "@/utils/projectHelpers";
import { mapIssue, handleStatusChange as handleStatusChangeHelper } from "@/utils/issueHelpers";


const ProjectKanbanPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedScope, setSelectedScope] = useState<string>("BACKLOG");
  const [kanbanIssues, setKanbanIssues] = useState<Issue[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchProject = useCallback(async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  }, [projectId]);

  const fetchSprints = useCallback(async () => {
    try {
      const response = await sprintService.getSprintsByProject(projectId!);
      const sprints = response.result || [];
      setSprints(sprints);
      const active = sprints.find(s => s.status === "ACTIVE");
      setSelectedScope(active ? active.id : "BACKLOG");
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  }, [projectId]);

  const fetchProjectMembers = useCallback(async () => {
    try {
      const response = await ProjectService.getProjectMembers(projectId!);
      setProjectMembers(response.result || []);
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
  }, [projectId]);


  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchSprints();
      fetchProjectMembers();
    }
  }, [projectId, fetchProject, fetchSprints, fetchProjectMembers]);

  const fetchKanbanIssues = useCallback(async () => {
    if (!projectId) return;
    try {
      let response;
      if (selectedScope === "BACKLOG") {
        response = await sprintService.getBacklogIssues(projectId!);
      } else {
        response = await sprintService.getIssuesBySprint(selectedScope);
      }
      const mappedIssues = (response.result || [])
        .map(mapIssue)
        .filter((issue): issue is Issue => issue !== null);
      setKanbanIssues(mappedIssues);
    } catch (error) {
      console.error("Error fetching kanban issues:", error);
      setKanbanIssues([]);
    }
  }, [projectId, selectedScope]);

  useEffect(() => {
    fetchKanbanIssues();
  }, [fetchKanbanIssues]);

  

  const canCreateIssue = () => {
    if (!user || !projectId) return false;
    const role = getCurrentUserRole(user, projectId!, project?.teamId);
    return role && role !== "VIEWER";
  };

  const canMoveIssue = (issue: Issue): boolean => {
    if (!user || !projectId) return false;
    return (
      issue.assignee?.id === user.id ||
      issue.reporter?.id === user.id ||
      isCurrentUserManager(user, projectId!)
    );
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    const issue = kanbanIssues.find(i => i.id === issueId);
    if (!issue || !user || !canMoveIssue(issue)) {
      toastError("Bạn không có quyền thay đổi trạng thái issue này!");
      return;
    }
    
    // Optimistically update UI
    setKanbanIssues(prev => prev.map(issue =>
      issue.id === issueId ? { ...issue, status: newStatus as Issue["status"] } : issue
    ));
    
    // Use helper function for API call
    await handleStatusChangeHelper(issueId, newStatus, () => {
      // Refresh data on success
      fetchKanbanIssues();
    });
  };




  if (!project) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        title={`${project?.name || ""} - Kanban Board`}
        showBackButton
      />

      <ProjectNavigation projectId={projectId!} activeTab="kanban" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                {selectedScope === "BACKLOG" ? (
                  <>Backlog</>
                ) : (
                  <>
                    Sprint: {sprints.find(s => s.id === selectedScope)?.name || ""}
                    {(() => {
                      const s = sprints.find(s => s.id === selectedScope);
                      if (!s) return null;
                      const text = s.status === "ACTIVE"
                        ? "Đang diễn ra"
                        : s.status === "COMPLETED"
                        ? "Đã kết thúc"
                        : s.status === "PLANNING"
                        ? "Đang lập kế hoạch"
                        : s.status === "CANCELLED"
                        ? "Đã hủy"
                        : s.status;
                      return <Badge variant="default">{text}</Badge>;
                    })()}
                  </>
                )}
              </CardTitle>
              <div className="w-64">
                <Select value={selectedScope} onValueChange={setSelectedScope}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sprint hoặc backlog" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    {sprints.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <KanbanBoard
              issues={kanbanIssues}
              projectMembers={projectMembers}
              onStatusChange={handleStatusChange}
              canCreateIssue={canCreateIssue() || false}
            />
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default ProjectKanbanPage; 