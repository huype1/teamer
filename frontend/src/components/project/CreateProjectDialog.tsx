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
import type { ProjectCreationRequest } from "@/types/project";
import { Switch } from "@/components/ui/switch";

interface CreateProjectDialogProps {
  onSubmit: (data: ProjectCreationRequest) => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  onSubmit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    key: "",
    teamId: "",
    isPublic: false,
    avatarUrl: ""
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: "", description: "", key: "", teamId: "", isPublic: false, avatarUrl: "" });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFormData({ name: "", description: "", key: "", teamId: "", isPublic: false, avatarUrl: "" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo dự án
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo dự án mới</DialogTitle>
          <DialogDescription>
            Tạo một dự án mới để tổ chức công việc và cộng tác với nhóm của bạn.
          </DialogDescription>
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setFormData({ ...formData, avatarUrl: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              placeholder="Chọn ảnh đại diện"
            />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Tạo dự án</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog; 