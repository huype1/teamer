import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";
import { uploadAvatar } from "@/service/avatarService";
import { toastError, toastSuccess } from "@/utils/toast";

interface AvatarUploadSimpleProps {
  currentAvatarUrl?: string;
  name: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AvatarUploadSimple: React.FC<AvatarUploadSimpleProps> = ({
  currentAvatarUrl,
  name,
  onAvatarChange,
  size = "md",
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
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

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-muted`}>
          <AvatarImage src={displayUrl} alt={name} />
          <AvatarFallback className="text-sm font-semibold">
            {name?.charAt(0) || "A"}
          </AvatarFallback>
        </Avatar>
        
        <Button
          size="sm"
          variant="secondary"
          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-3 w-3" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl && (
        <Button
          size="sm"
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-1 text-xs"
        >
          <Upload className="h-3 w-3" />
          {uploading ? "Đang tải..." : "Lưu"}
        </Button>
      )}
    </div>
  );
}; 