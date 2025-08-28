import React, { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import type { Project, ProjectUpdateRequest } from "@/types/project";

interface EditProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSubmit: (projectId: string, data: ProjectUpdateRequest) => void;
}

const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  isOpen,
  onOpenChange,
  project,
  onSubmit,
}) => {
  console.log(project, "project info")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientName: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        clientName: project.clientName || "",
        startDate: project.startDate || "",
        endDate: project.endDate || ""
      });
    }
  }, [project]);

  const handleSubmit = () => {
    if (project) {
      onSubmit(project.id, formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa dự án</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và cài đặt dự án của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Tên dự án</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Mô tả</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-clientName">Tên khách hàng</Label>
            <Input
              id="edit-clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Nhập tên khách hàng (tùy chọn)"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-startDate">Ngày bắt đầu</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-endDate">Ngày kết thúc</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Cập nhật dự án</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog; 