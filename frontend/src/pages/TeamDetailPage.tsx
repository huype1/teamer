import React, { useEffect, useState } from "react";
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
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Users, Calendar, FolderOpen, ArrowLeft } from "lucide-react";
import teamService from "@/service/teamService";
import projectService from "@/service/projectService";
import { TeamMemberManagement } from "@/components/team";
import type { Team, TeamUser } from "@/types/team";
import type { Project } from "@/types/project";
import { toastSuccess, toastError } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { getCurrentUserRole } from "@/utils/projectHelpers";
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

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamRes, membersRes, projectsRes] = await Promise.all([
        teamService.getTeamById(teamId!),
        teamService.getTeamUsers(teamId!),
        projectService.getProjectsByTeam(teamId!)
      ]);
      console.log("Team data fetched:", teamRes, membersRes, projectsRes);
      
      setTeam(teamRes.result);
      
      // Handle members data - API trả về thông tin đầy đủ
      if (membersRes.result && Array.isArray(membersRes.result)) {
        setMembers(membersRes.result);
      } else {
        console.warn("Invalid members data:", membersRes);
        setMembers([]);
      }
      
      setProjects(projectsRes.result || []);
      
      // Set form default values
      reset({
        name: teamRes.result.name,
        description: teamRes.result.description,
      });
    } catch (error) {
      console.error("Error fetching team data:", error);
      setError("Failed to load team data");
      // Set empty arrays to prevent further errors
      setMembers([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

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
          {user && getCurrentUserRole(user, teamId!) === "ADMIN" && (
            <>
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

      {/* Team Member Management */}
      <div className="mb-6">
        <TeamMemberManagement 
          teamId={teamId!} 
          canManageTeam={user ? getCurrentUserRole(user, teamId!) === "ADMIN" : false}
        />
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
                        <span className="text-xs text-muted-foreground">
                          {project.memberCount} thành viên
                        </span>
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