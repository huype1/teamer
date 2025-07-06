import React, { useState } from "react";
import { UserPlus, Mail, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Project } from "@/types/project";

interface MemberManagementProps {
  project: Project;
  onAddMember: (email: string, role: string) => void;
  onRemoveMember: (userId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MemberManagement: React.FC<MemberManagementProps> = ({
  project,
  onAddMember,
  onRemoveMember,
  isOpen,
  onOpenChange
}) => {
  const [memberFormData, setMemberFormData] = useState({
    email: "",
    role: "MEMBER",
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddMember = () => {
    if (memberFormData.email.trim()) {
      onAddMember(memberFormData.email, memberFormData.role);
      setMemberFormData({ email: "", role: "MEMBER" });
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setMemberFormData({ email: "", role: "MEMBER" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quản lý thành viên dự án</DialogTitle>
          <DialogDescription>
            Thêm hoặc xóa thành viên cho dự án {project.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Member Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thêm thành viên mới</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Địa chỉ email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email thành viên"
                    value={memberFormData.email}
                    onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select value={memberFormData.role} onValueChange={(value) => setMemberFormData({ ...memberFormData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Thành viên</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddMember} disabled={!memberFormData.email.trim()}>
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm thành viên
              </Button>
            </CardContent>
          </Card>

          {/* Current Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Danh sách thành viên</CardTitle>
            </CardHeader>
            <CardContent>
              {project.members && project.members.length > 0 ? (
                <div className="space-y-3">
                  {project.members.map((member) => (
                    <div key={member.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.avatarUrl} />
                          <AvatarFallback>
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.user.name}</p>
                          <p className="text-xs text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                          {member.role}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Gửi tin nhắn
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onRemoveMember(member.user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Chưa có thành viên nào. Hãy thêm thành viên để cùng cộng tác.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberManagement; 