import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadTeamAvatar } from "@/service/avatarService";
import { toastError, toastSuccess } from "@/utils/toast";
import { useDispatch } from "react-redux";
import { refreshUserInfo } from "@/store/authReducer";

interface CreateTeamDialogProps {
  onSubmit: (data: { name: string; description: string; avatarUrl?: string }) => Promise<{ result: { id: string } }>;
}

const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", avatarUrl: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      
      // Submit team data first
      const response = await onSubmit(formData);
      
      // Refresh user info để cập nhật teamMembers
      await dispatch(refreshUserInfo());
      
      // If there's a selected file, upload it after team creation
      if (selectedFile && response?.result?.id) {
        try {
          await uploadTeamAvatar(response.result.id, selectedFile);
          toastSuccess("Nhóm đã được tạo và ảnh đại diện đã được cập nhật!");
        } catch (error) {
          console.error("Error uploading avatar:", error);
          toastError("Nhóm đã được tạo nhưng không thể cập nhật ảnh đại diện!");
        }
      } else {
        toastSuccess("Nhóm đã được tạo thành công!");
      }
      
      // Reset form
      setFormData({ name: "", description: "", avatarUrl: "" });
      setSelectedFile(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating team:", error);
      toastError("Không thể tạo nhóm!");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFormData({ name: "", description: "", avatarUrl: "" });
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo nhóm
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo nhóm mới</DialogTitle>
          <DialogDescription>
            Tạo một nhóm mới để cộng tác với các thành viên khác.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên nhóm</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên nhóm"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả nhóm"
              required
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
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)} disabled={creating}>
              Hủy
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Đang tạo..." : "Tạo nhóm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog; 