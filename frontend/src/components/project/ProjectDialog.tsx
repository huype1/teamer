import React, { useState, useEffect } from "react";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTeamsWhereUserIsAdmin } from "@/service/teamService";
import { uploadProjectAvatar } from "@/service/avatarService";
import { toastError, toastSuccess } from "@/utils/toast";
import { useDispatch } from "react-redux";
import { refreshUserInfo } from "@/store/authReducer";
import type { Team } from "@/types/team";
import type { ProjectCreationRequest, ProjectUpdateRequest, Project } from "@/types/project";

interface ProjectDialogProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSubmit: (data: ProjectCreationRequest | ProjectUpdateRequest) => Promise<{ result: { id: string } }>;
  trigger?: React.ReactNode;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  mode,
  isOpen,
  onOpenChange,
  project,
  onSubmit,
  trigger
}) => {
  const dispatch = useDispatch();
  const isEditMode = mode === 'edit';
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    key: "",
    teamId: "",
    isPublic: false,
    avatarUrl: "",
    clientName: "",
    startDate: "",
    endDate: ""
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adminTeams, setAdminTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingTeams(true);
      getTeamsWhereUserIsAdmin().then((res) => {
        setAdminTeams(res.result || []);
        setLoadingTeams(false);
      }).catch(() => setLoadingTeams(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isEditMode && project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        key: project.key || "",
        teamId: project.team?.id || "",
        isPublic: project.isPublic || false,
        avatarUrl: project.avatarUrl || "",
        clientName: project.clientName || "",
        startDate: project.startDate || "",
        endDate: project.endDate || ""
      });
    }
  }, [isEditMode, project]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        teamId: formData.teamId === "none" ? "" : formData.teamId
      };
      
      if (isEditMode && project) {
        await onSubmit(submitData);
        toastSuccess("Dự án đã được cập nhật thành công!");
      } else {
        const response = await onSubmit(submitData);
        
        await dispatch(refreshUserInfo());
        
        if (selectedFile && response?.result?.id) {
          try {
            await uploadProjectAvatar(response.result.id, selectedFile);
            toastSuccess("Dự án đã được tạo và ảnh đại diện đã được cập nhật!");
          } catch (error) {
            console.error("Error uploading avatar:", error);
            toastError("Dự án đã được tạo nhưng không thể cập nhật ảnh đại diện!");
          }
        } else {
          toastSuccess("Dự án đã được tạo thành công!");
        }
      }
      
      // Reset form and close dialog
      if (!isEditMode) {
        setFormData({ name: "", description: "", key: "", teamId: "", isPublic: false, avatarUrl: "", clientName: "", startDate: "", endDate: "" });
        setSelectedFile(null);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting project:", error);
      toastError(isEditMode ? "Không thể cập nhật dự án!" : "Không thể tạo dự án!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open && !isEditMode) {
      setFormData({ name: "", description: "", key: "", teamId: "", isPublic: false, avatarUrl: "", clientName: "", startDate: "", endDate: "" });
      setSelectedFile(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toastError("Vui lòng chọn file ảnh!");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastError("File ảnh không được lớn hơn 5MB!");
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const title = isEditMode ? 'Chỉnh sửa dự án' : 'Tạo dự án mới';
  const description = isEditMode 
    ? 'Cập nhật thông tin và cài đặt dự án của bạn.'
    : 'Tạo một dự án mới để tổ chức công việc và cộng tác với nhóm của bạn.';
  const submitText = isEditMode ? 'Cập nhật dự án' : 'Tạo dự án';
  const submittingText = isEditMode ? 'Đang cập nhật...' : 'Đang tạo...';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (null
      )}
      <DialogContent className="sm:max-w-[500px] h-[80vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên dự án</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên dự án"
            />
          </div>
          
          {!isEditMode && (
            <div className="grid gap-2">
              <Label htmlFor="key">Mã dự án</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                placeholder="VD: PROJ"
                maxLength={6}
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="isPublic">Dự án cộng đồng</Label>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="avatarUrl">Ảnh đại diện</Label>
            <Input
              type="file"
              accept="image/*"
              id="avatarUrl"
              onChange={handleFileSelect}
              placeholder="Chọn ảnh đại diện"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                Đã chọn: {selectedFile.name}
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả dự án"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="clientName">Tên khách hàng</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Nhập tên khách hàng (tùy chọn)"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="teamId">Nhóm</Label>
            <Select
              value={formData.teamId}
              onValueChange={(value) => setFormData({ ...formData, teamId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTeams ? "Đang tải..." : "Chọn nhóm"} />
              </SelectTrigger>
              <SelectContent>
                {!loadingTeams && (
                  <>
                    <SelectItem value="none">Không thuộc nhóm nào</SelectItem>
                    {adminTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? submittingText : submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;

