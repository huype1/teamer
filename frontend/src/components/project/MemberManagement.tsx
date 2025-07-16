import React, { useState } from "react";
import { UserPlus, Trash2, MoreHorizontal, Shield } from "lucide-react";
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
import type { Project, ProjectMember } from "@/types/project";
import type { User } from "@/types/user";

interface MemberManagementProps {
  project: Project;
  projectMembers: ProjectMember[];
  projectUsers: User[];
  onAddMember: (email: string, role: string) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateRole?: (userId: string, newRole: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  canAddMembers?: boolean;
  canRemoveMembers?: boolean;
  canUpdateRoles?: boolean;
}

const MemberManagement: React.FC<MemberManagementProps> = ({
  project,
  projectMembers,
  projectUsers,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  isOpen,
  onOpenChange,
  canAddMembers = true,
  canRemoveMembers = true,
  canUpdateRoles = true
}) => {
  const [memberFormData, setMemberFormData] = useState({
    email: "",
    role: "MEMBER",
  });

  const [roleUpdateDialog, setRoleUpdateDialog] = useState({
    isOpen: false,
    member: null as ProjectMember | null,
    newRole: "MEMBER",
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

  const handleUpdateRole = (member: ProjectMember) => {
    setRoleUpdateDialog({
      isOpen: true,
      member,
      newRole: member.role,
    });
  };

  const handleConfirmRoleUpdate = () => {
    if (roleUpdateDialog.member && onUpdateRole) {
      onUpdateRole(roleUpdateDialog.member.userId, roleUpdateDialog.newRole);
      setRoleUpdateDialog({ isOpen: false, member: null, newRole: "MEMBER" });
    }
  };

  const handleCancelRoleUpdate = () => {
    setRoleUpdateDialog({ isOpen: false, member: null, newRole: "MEMBER" });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[95vw] max-w-[500px] p-0">
          <div className="flex flex-col max-h-[80vh]">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>Quản lý thành viên dự án</DialogTitle>
              <DialogDescription>
                Thêm hoặc xóa thành viên cho dự án {project.name}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto px-6 pb-6 pt-2 flex-1 space-y-6">
              {/* Add Member Form */}
              {canAddMembers && (
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
                            <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                            <SelectItem value="PM">Quản lý dự án</SelectItem>
                            <SelectItem value="MEMBER">Thành viên</SelectItem>
                            <SelectItem value="VIEWER">Người xem</SelectItem>
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
              )}

              {/* Current Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Danh sách thành viên</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectMembers && projectMembers.length > 0 ? (
                    <div className="space-y-3">
                      {projectMembers.map((member) => {
                        const user = projectUsers.find(u => u.id === member.userId);
                        return (
                          <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatarUrl} />
                                <AvatarFallback>
                                  {user ? getInitials(user.name) : member.userId.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user?.name || 'Unknown User'}</p>
                                <p className="text-xs text-muted-foreground">{user?.email || member.userId}</p>
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
                                  {onUpdateRole && canUpdateRoles && member.userId !== project.creator.id && (
                                    <DropdownMenuItem onClick={() => handleUpdateRole(member)}>
                                      <Shield className="mr-2 h-4 w-4" />
                                      Thay đổi quyền
                                    </DropdownMenuItem>
                                  )}
                                  {canRemoveMembers && (
                                    <DropdownMenuItem 
                                      onClick={() => onRemoveMember(member.userId)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Xóa
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Chưa có thành viên nào</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Update Dialog */}
      <Dialog open={roleUpdateDialog.isOpen} onOpenChange={handleCancelRoleUpdate}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Thay đổi quyền thành viên</DialogTitle>
            <DialogDescription>
              Cập nhật vai trò cho thành viên này
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {roleUpdateDialog.member && (
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={projectUsers.find(u => u.id === roleUpdateDialog.member?.userId)?.avatarUrl} />
                  <AvatarFallback>
                    {projectUsers.find(u => u.id === roleUpdateDialog.member?.userId)?.name.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {projectUsers.find(u => u.id === roleUpdateDialog.member?.userId)?.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {projectUsers.find(u => u.id === roleUpdateDialog.member?.userId)?.email || roleUpdateDialog.member?.userId}
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="newRole">Vai trò mới</Label>
              <Select 
                value={roleUpdateDialog.newRole} 
                onValueChange={(value) => setRoleUpdateDialog({ ...roleUpdateDialog, newRole: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="PM">Quản lý dự án</SelectItem>
                  <SelectItem value="MEMBER">Thành viên</SelectItem>
                  <SelectItem value="VIEWER">Người xem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRoleUpdate}>
              Hủy
            </Button>
            <Button onClick={handleConfirmRoleUpdate}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemberManagement; 