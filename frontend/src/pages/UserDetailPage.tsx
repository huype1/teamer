import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
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
      toastSuccess("Cập nhật thông tin thành công!");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
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
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-20 h-20 mb-2">
            <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} />
            <AvatarFallback>{userInfo.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-bold mt-2">Thông tin cá nhân</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                disabled
                {...register("email")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name">Tên</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nhập tên của bạn"
                {...register("name", { required: "Tên không được để trống" })}
                className="mt-1"
                disabled={updating}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="avatarUrl">Ảnh đại diện (URL)</Label>
              <Input
                id="avatarUrl"
                type="text"
                placeholder="Dán link ảnh đại diện"
                {...register("avatarUrl")}
                className="mt-1"
                disabled={updating}
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button type="submit" disabled={updating} className="bg-primary text-white">
                Lưu thay đổi
              </Button>
              {/* <Button type="button" variant="outline" onClick={handleCancel} disabled={updating}>
                Hủy
              </Button> */}
              <Button type="button" variant="destructive" onClick={handleDeleteAccount} disabled={updating}>
                Xóa tài khoản
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailPage; 