import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Download } from "lucide-react";
import attachmentService, { type Attachment } from "@/service/attachmentService";

interface AttachmentListProps {
  attachments: Attachment[];
  title?: string;
  className?: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  title = "File đính kèm",
  className = "",
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentService.downloadFile(attachment);
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
    }
  };

     return (
     <div className={`mt-3 ${className}`}>
       <div className="text-xs font-semibold mb-2 flex items-center gap-1 text-muted-foreground">
         <Paperclip className="h-3 w-3" />
         {title}:
       </div>
       <div className="space-y-2">
         {attachments.map((file) => (
           <div key={file.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-md p-2">
             <Button
               variant="link"
               size="sm"
               className="h-auto p-0 text-blue-600 hover:text-blue-800 flex items-center gap-1 flex-1 justify-start"
               onClick={() => handleDownload(file)}
             >
               <Download className="h-3 w-3 flex-shrink-0" />
               <span className="truncate">{file.fileName}</span>
             </Button>
             <span className="text-muted-foreground flex-shrink-0">
               ({Math.round(file.fileSize / 1024)} KB)
             </span>
           </div>
         ))}
       </div>
     </div>
   );
}; 