import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X, Upload } from "lucide-react";
import { uploadAvatar, deleteAvatar } from "@/service/avatarService";
import { toastError, toastSuccess } from "@/utils/toast";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userName,
  onAvatarChange,
  size = "md",
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await uploadAvatar(file);
      onAvatarChange(response.result);
      setPreviewUrl(null);
      toastSuccess("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      console.error("Upload error:", error);
      toastError("Không thể cập nhật ảnh đại diện!");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setUploading(true);
      await deleteAvatar();
      onAvatarChange("");
      setPreviewUrl(null);
      toastSuccess("Đã xóa ảnh đại diện!");
    } catch (error) {
      console.error("Delete error:", error);
      toastError("Không thể xóa ảnh đại diện!");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-muted`}>
          <AvatarImage src={displayUrl} alt={userName} />
          <AvatarFallback className="text-lg font-semibold">
            {userName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        
        {!previewUrl && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Đang tải..." : "Lưu"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={uploading}
          >
            Hủy
          </Button>
        </div>
      )}

      {currentAvatarUrl && !previewUrl && (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Xóa ảnh
        </Button>
      )}
    </div>
  );
}; 