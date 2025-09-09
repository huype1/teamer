import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Users, Calendar, FolderOpen, ArrowLeft, Plus, Upload, X } from "lucide-react";
import teamService from "@/service/teamService";
import projectService from "@/service/projectService";
import avatarService from "@/service/avatarService";
import { TeamMemberManagement } from "@/components/team";
import type { Team, TeamUser } from "@/types/team";
import type { Project } from "@/types/project";
import { toastSuccess, toastError } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { getCurrentUserRoleTeam, isCurrentUserTeamAdmin } from "@/utils/projectHelpers";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const teamEditSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
});

type TeamEditFormData = z.infer<typeof teamEditSchema>;

const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamUser[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loadingAvailableProjects, setLoadingAvailableProjects] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamEditFormData>({
    resolver: zodResolver(teamEditSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      const [teamRes, membersRes, projectsRes] = await Promise.all([
        teamService.getTeamById(teamId!),
        teamService.getTeamUsers(teamId!),
        projectService.getProjectsByTeam(teamId!)
      ]);
      console.log("hey this is team message:", user, getCurrentUserRoleTeam(user,  teamId!));
      
      setTeam(teamRes.result);
      
      if (membersRes.result && Array.isArray(membersRes.result)) {
        setMembers(membersRes.result);
      } else {
        console.warn("Invalid members data:", membersRes);
        setMembers([]);
      }
      
      setProjects(projectsRes.result || []);
      
      reset({
        name: teamRes.result.name,
        description: teamRes.result.description,
      });
    } catch (error) {
      console.error("Error fetching team data:", error);
      setError("Failed to load team data");
      setMembers([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, reset, user]);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId, fetchTeamData]);

  const handleEditSubmit = async (data: TeamEditFormData) => {
    try {
      await teamService.updateTeam(teamId!, data);
      toastSuccess("Cập nhật nhóm thành công!");
      setEditDialogOpen(false);
      fetchTeamData();
    } catch (error) {
      toastError("Cập nhật nhóm thất bại!");
      console.error("Error updating team:", error);
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    setEditDialogOpen(open);
    if (open && team) {
      reset({
        name: team.name,
        description: team.description,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await teamService.deleteTeam(teamId!);
      toastSuccess("Xóa nhóm thành công!");
      navigate("/teams");
    } catch (error) {
      toastError("Xóa nhóm thất bại!");
      console.error("Error deleting team:", error);
    }
  };

  const fetchAvailableProjects = async () => {
    try {
      setLoadingAvailableProjects(true);
      const response = await projectService.getProjects();
      // Filter out projects that are already in a team
      const available = response.result.filter((project: Project) => !project.teamId);
      setAvailableProjects(available);
    } catch (error) {
      console.error("Error fetching available projects:", error);
      toastError("Không thể tải danh sách dự án!");
    } finally {
      setLoadingAvailableProjects(false);
    }
  };

  const handleAddProjectToTeam = async (projectId: string) => {
    try {
      await projectService.addProjectToTeam(projectId, teamId!);
      toastSuccess("Thêm dự án vào nhóm thành công!");
      setAddProjectDialogOpen(false);
      fetchTeamData();
    } catch (error) {
      toastError("Thêm dự án vào nhóm thất bại!");
      console.error("Error adding project to team:", error);
    }
  };

  const handleDeleteProjectClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteProjectDialogOpen(true);
  };

  const handleRemoveProjectFromTeam = async () => {
    if (!projectToDelete) return;
    
    try {
      await projectService.removeProjectFromTeam(projectToDelete.id);
      toastSuccess("Xóa dự án khỏi nhóm thành công!");
      setDeleteProjectDialogOpen(false);
      setProjectToDelete(null);
      fetchTeamData();
    } catch (error) {
      toastError("Xóa dự án khỏi nhóm thất bại!");
      console.error("Error removing project from team:", error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      await avatarService.uploadTeamAvatar(teamId!, file);
      toastSuccess("Cập nhật avatar thành công!");
      fetchTeamData();
    } catch (error) {
      toastError("Cập nhật avatar thất bại!");
      console.error("Error uploading avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!team) return <div className="p-4">Team not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          
          {/* Team Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {team.avatarUrl ? (
                <img 
                  src={team.avatarUrl} 
                  alt={team.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            {user && getCurrentUserRoleTeam(user, teamId!) === "ADMIN" && (
              <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors">
                <Upload className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
            <p className="text-muted-foreground mb-4">{team.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Tạo ngày {formatDate(team.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{members.length} thành viên</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span>{projects.length} dự án</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {user && getCurrentUserRoleTeam(user, teamId!) === "ADMIN" && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setAddProjectDialogOpen(true);
                  fetchAvailableProjects();
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm dự án
              </Button>
              
              <Dialog open={editDialogOpen} onOpenChange={handleEditDialogChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </Button>
                </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Tên nhóm</Label>
                  <Input
                    id="name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">{errors.name.message}</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                  />
                  {errors.description && (
                    <span className="text-xs text-red-500">{errors.description.message}</span>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Xóa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xóa nhóm</DialogTitle>
              </DialogHeader>
              <p>Bạn có chắc chắn muốn xóa nhóm "{team.name}"? Hành động này không thể hoàn tác.</p>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Xóa nhóm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={addProjectDialogOpen} onOpenChange={setAddProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm dự án vào nhóm</DialogTitle>
            <DialogDescription>
              Chọn dự án để thêm vào nhóm {team.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingAvailableProjects ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2">Đang tải danh sách dự án...</span>
              </div>
            ) : availableProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có dự án nào có thể thêm vào nhóm</p>
                <p className="text-sm">Tất cả dự án đã được gán cho nhóm khác</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">Key: {project.key}</span>
                        <Badge variant={project.isPublic ? "default" : "secondary"}>
                          {project.isPublic ? "Công khai" : "Riêng tư"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddProjectToTeam(project.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddProjectDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Project Dialog */}
      <Dialog open={deleteProjectDialogOpen} onOpenChange={setDeleteProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa dự án khỏi nhóm</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa dự án "{projectToDelete?.name}" khỏi nhóm? Dự án sẽ trở thành dự án độc lập.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteProjectDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleRemoveProjectFromTeam}>
              Xóa khỏi nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Member Management */}
      <div className="mb-6">
        {(() => {
          const canManage = user ? isCurrentUserTeamAdmin(user, teamId!) : false;
          
          return (
            <div>
              
              <TeamMemberManagement 
                teamId={teamId!} 
                canManageTeam={canManage}
              />
            </div>
          );
        })()}
      </div>

      {/* Projects Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Dự án của nhóm
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Chưa có dự án nào</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium" onClick={() => navigate(`/projects/${project.id}`)}>{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">Key: {project.key}</span>
                        
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.isPublic ? "default" : "secondary"}>
                      {project.isPublic ? "Công khai" : "Riêng tư"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Tạo {formatDate(project.createdAt)}
                    </span>
                    {user && getCurrentUserRoleTeam(user, teamId!) === "ADMIN" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProjectClick(project)}
                        className="text-destructive hover:text-destructive"
                        title="Xóa dự án khỏi nhóm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDetailPage; 