import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface FilePreviewListProps {
  files: File[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export const FilePreviewList: React.FC<FilePreviewListProps> = ({ files, onRemove, disabled = false }) => {
  if (!files || files.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1">
      {files.map((file, idx) => (
        <li key={idx} className="flex items-center gap-2 text-sm bg-muted rounded px-2 py-1">
          <span className="truncate max-w-xs">{file.name}</span>
          <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => onRemove(idx)}
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </li>)
      )}
    </ul>
  );
};

export default FilePreviewList;

