import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { Plus, Crown, User as UserIcon, Eye } from "lucide-react";
import { toastSuccess, toastError } from "@/utils/toast";
import teamService from "@/service/teamService";
import userService from "@/service/userService";
import type { TeamUser } from "@/types/team";
import type { User } from "@/types/user";

interface TeamMemberManagementProps {
  teamId: string;
  canManageTeam: boolean;
}

const TeamMemberManagement: React.FC<TeamMemberManagementProps> = ({
  teamId,
  canManageTeam,
}) => {
  const [members, setMembers] = useState<TeamUser[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { handleSubmit: handleAddSubmit, reset: resetAddForm, setValue: setAddValue, watch: watchAdd } = useForm({
    defaultValues: {
      userId: "",
      role: "MEMBER",
    },
  });

  const { handleSubmit: handleRoleSubmit, setValue: setRoleValue, watch: watchRole } = useForm({
    defaultValues: {
      role: "MEMBER",
    },
  });

  useEffect(() => {
    fetchTeamMembers();
    fetchAllUsers();
  }, [teamId]);

  const fetchTeamMembers = async () => {
    try {
      const response = await teamService.getTeamUsers(teamId);
      setMembers(response.result || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toastError("Không thể tải danh sách thành viên!");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await userService.getUsers();
      setAllUsers(response.result || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddMember = async (data: { userId: string; role: string }) => {
    try {
      await teamService.addMemberToTeam(teamId, data.userId, data.role);
      toastSuccess("Thêm thành viên thành công!");
      setIsAddDialogOpen(false);
      resetAddForm();
      fetchTeamMembers();
    } catch (error) {
      toastError("Thêm thành viên thất bại!");
    }
  };

  const handleUpdateRole = async (data: { role: string }) => {
    if (!selectedMember) return;
    try {
      await teamService.updateMemberRole(teamId, selectedMember.userId, data.role);
      toastSuccess("Cập nhật vai trò thành công!");
      setIsRoleDialogOpen(false);
      setSelectedMember(null);
      fetchTeamMembers();
    } catch (error) {
      toastError("Cập nhật vai trò thất bại!");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await teamService.removeMember(teamId, memberId);
      toastSuccess("Xóa thành viên thành công!");
      fetchTeamMembers();
    } catch (error) {
      toastError("Xóa thành viên thất bại!");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "MEMBER":
        return <UserIcon className="h-4 w-4 text-blue-500" />;
      case "VIEWER":
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "MEMBER":
        return "secondary";
      case "VIEWER":
        return "outline";
      default:
        return "outline";
    }
  };

  // Lọc users chưa là thành viên team
  const availableUsers = allUsers.filter(user => 
    !members.some(member => member.userId === user.id) &&
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Thành viên nhóm</h3>
        {canManageTeam && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm thành viên
          </Button>
        )}
      </div>

      {/* Members List */}
      <Card>
        <CardContent className="p-0">
          {members.length > 0 ? (
            <div className="divide-y">
              {members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback>
                        {member.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(member.role)}
                        <span>{member.role}</span>
                      </div>
                    </Badge>
                    {canManageTeam && member.role !== "ADMIN" && (
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setRoleValue("role", member.role);
                            setIsRoleDialogOpen(true);
                          }}
                        >
                          Sửa vai trò
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                        >
                          Xóa
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có thành viên nào</p>
              {canManageTeam && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Thêm thành viên đầu tiên
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thành viên mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit(handleAddMember)} className="space-y-4">
            <div>
              <Input
                placeholder="Tìm kiếm theo email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              <Select
                value={watchAdd("userId")}
                onValueChange={(v) => setAddValue("userId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người dùng" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name} ({user.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={watchAdd("role")}
                onValueChange={(v) => setAddValue("role", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Thêm thành viên</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật vai trò cho {selectedMember?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRoleSubmit(handleUpdateRole)} className="space-y-4">
            <div>
              <Select
                value={watchRole("role")}
                onValueChange={(v) => setRoleValue("role", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMemberManagement; 