import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toastSuccess, toastError } from "@/utils/toast";
import { updateMyInfo } from "@/service/userService";

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Xác nhận mật khẩu không được để trống"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;

interface PasswordUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PasswordUpdateModal: React.FC<PasswordUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordUpdateFormData>({
    resolver: zodResolver(passwordUpdateSchema),
  });

  const onSubmit = async (data: PasswordUpdateFormData) => {
    try {
      // Tạm thời bỏ qua password update vì backend chưa support
      toastError("Tính năng đổi mật khẩu chưa được hỗ trợ!");
      reset();
      onClose();
    } catch (error) {
      toastError("Cập nhật mật khẩu thất bại!");
      console.error("Error updating password:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật mật khẩu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              {...register("currentPassword")}
              className="mt-1"
              disabled={isSubmitting}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
              {...register("newPassword")}
              className="mt-1"
              disabled={isSubmitting}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...register("confirmPassword")}
              className="mt-1"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Cập nhật mật khẩu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 