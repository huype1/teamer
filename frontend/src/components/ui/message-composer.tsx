import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";
import attachmentService, { type AttachmentMeta } from "@/service/attachmentService";
import FilePreviewList from "@/components/ui/file-preview-list";

const schema = z.object({
  content: z.string().min(1, "Nội dung không được để trống"),
});

export interface MessageComposerSubmission {
  content: string;
  attachments: AttachmentMeta[];
}

interface MessageComposerProps {
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (data: MessageComposerSubmission) => Promise<void> | void;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  placeholder = "Nhập nội dung...",
  submitLabel = "Gửi",
  onSubmit,
  disabled = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { content: "" },
  });

  const uploadFilesToS3 = async (files: File[]) => {
    setUploading(true);
    const uploaded: AttachmentMeta[] = [];
    for (const file of files) {
      try {
        const meta = await attachmentService.uploadFile(file);
        uploaded.push(meta);
      } catch (error) {
        console.error("Lỗi khi upload file:", error);
      }
    }
    setUploading(false);
    return uploaded;
  };

  const onInternalSubmit = async (data: z.infer<typeof schema>) => {
    let attachments: AttachmentMeta[] = [];
    if (selectedFiles.length > 0) {
      attachments = await uploadFilesToS3(selectedFiles);
    }
    await onSubmit({ content: data.content, attachments });
    reset();
    setSelectedFiles([]);
  };

  function FileUploadInput({ selected, setSelected, uploading }: { selected: File[]; setSelected: (files: File[]) => void; uploading: boolean; }) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelected(Array.from(e.target.files || []));
    };

    return (
      <div className="mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Paperclip className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">Đính kèm file</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onInternalSubmit)} className="space-y-2">
      <Textarea
        placeholder={placeholder}
        {...register("content")}
        rows={3}
        className="resize-none"
        disabled={disabled}
      />
      <FileUploadInput selected={selectedFiles} setSelected={setSelectedFiles} uploading={uploading} />
      <FilePreviewList files={selectedFiles} onRemove={(idx) => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))} disabled={uploading} />
      {errors.content && (
        <span className="text-xs text-red-500">{errors.content.message}</span>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={disabled || isSubmitting || uploading}>
          <Send className="w-4 h-4 mr-2" />
          {disabled || isSubmitting || uploading ? "Đang gửi..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default MessageComposer;

