import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Save, Edit3, Trash2 } from "lucide-react";
import type { User as UserType } from "@/types/user";
import { getMyInfo, updateMyInfo, deleteMyAccount } from "@/service/userService";
import { toastError, toastSuccess } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authReducer";
import type { AppDispatch } from "@/store";

interface UserFormData {
  email: string;
  name: string;
  avatarUrl?: string;
}

const UserDetailPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<UserFormData>();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await getMyInfo();
      setUserInfo(response.result);
      setValue("email", response.result.email);
      setValue("name", response.result.name);
      setValue("avatarUrl", response.result.avatarUrl || "");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setUpdating(true);
      const response = await updateMyInfo(data);
      setUserInfo(response.result);
      setIsEditing(false);
      toastSuccess("Cập nhật thông tin thành công!");
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      email: userInfo?.email || "",
      name: userInfo?.name || "",
      avatarUrl: userInfo?.avatarUrl || ""
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await deleteMyAccount();
      toastSuccess("Tài khoản đã được xóa thành công!");
      dispatch(logout());
      navigate("/");
    } finally {
      toastError("Xóa tài khoản thất bại!");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy thông tin</h3>
            <p className="text-muted-foreground text-center">
              Không thể tải thông tin người dùng
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userInfo.avatarUrl} />
                <AvatarFallback className="text-lg">
                  {userInfo.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{userInfo.name}</h3>
                <p className="text-muted-foreground">{userInfo.email}</p>
                <Badge variant="outline" className="mt-1">
                  {userInfo.provider}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { 
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email không hợp lệ"
                    }
                  })}
                  disabled={!isEditing}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Họ tên</Label>
                <Input
                  id="name"
                  {...register("name", { 
                    required: "Họ tên là bắt buộc",
                    minLength: {
                      value: 2,
                      message: "Họ tên phải có ít nhất 2 ký tự"
                    }
                  })}
                  disabled={!isEditing}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL Avatar</Label>
                <Input
                  id="avatarUrl"
                  {...register("avatarUrl")}
                  disabled={!isEditing}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                <span className="text-sm font-medium">
                  {new Date(userInfo.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Cập nhật lần cuối:</span>
                <span className="text-sm font-medium">
                  {new Date(userInfo.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-6">
              {isEditing ? (
                <>
                  <Button type="submit" disabled={updating} className="gap-2">
                    {updating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu thay đổi
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Hủy
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" onClick={handleEdit} className="gap-2">
                    <Edit3 className="w-4 h-4" />
                    Chỉnh sửa
                  </Button>
                  <Button type="button" onClick={handleDeleteAccount} variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Xóa tài khoản
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailPage; 