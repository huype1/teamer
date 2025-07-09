import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, UserMinus, Shield } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { User } from "@/types/user";
import { isCurrentUserAdmin } from "@/utils/projectHelpers";
import { toastError, toastSuccess } from "@/utils/toast";

const UserManagementPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isCurrentUserAdmin(user, "", "")) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Implement user service to fetch all users
      // const response = await userService.getAllUsers();
      // setUsers(response.result || []);
      setUsers([]); // Placeholder
    } catch (error) {
      console.error("Error fetching users:", error);
      toastError("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (_userId: string) => {
    try {
      // TODO: Implement user deletion
      // await userService.deleteUser(userId);
      toastSuccess("Xóa người dùng thành công!");
      fetchUsers();
    } catch (error) {
      toastError("Xóa người dùng thất bại!");
    }
  };

  const handleToggleAdmin = async (_userId: string, _isAdmin: boolean) => {
    try {
      // TODO: Implement admin toggle
      // await userService.updateUserRole(userId, isAdmin ? "USER" : "ADMIN");
      toastSuccess("Cập nhật quyền thành công!");
      fetchUsers();
    } catch (error) {
      toastError("Cập nhật quyền thất bại!");
    }
  };

  if (!isCurrentUserAdmin(user, "", "")) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không có quyền truy cập</h3>
            <p className="text-muted-foreground text-center">
              Chỉ quản trị viên mới có thể truy cập trang quản lý người dùng
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có người dùng nào</h3>
            <p className="text-muted-foreground mb-4">
              Hệ thống chưa có người dùng nào được đăng ký
            </p>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Thêm người dùng đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
    <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Đăng ký: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.provider === "GOOGLE" ? "default" : "secondary"}>
                    {user.provider}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAdmin(user.id, false)}
                    className="gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    {user.provider === "GOOGLE" ? "Admin" : "User"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="gap-1"
                  >
                    <UserMinus className="w-3 h-3" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagementPage; 