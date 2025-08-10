import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paperclip, Download, Image, X, ChevronLeft, ChevronRight, FileImage } from "lucide-react";
import attachmentService, { type Attachment } from "@/service/attachmentService";

interface AttachmentListProps {
  attachments: Attachment[];
  title?: string;
  className?: string;
}

// Helper function to check if file is an image
const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

// Helper function to get file icon
const getFileIcon = (fileType: string) => {
  if (isImageFile(fileType)) {
    return Image;
  }
  return Paperclip;
};

// Image Preview Component with error handling
const ImagePreview: React.FC<{ attachment: Attachment; onClick: () => void }> = ({ attachment, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Get download URL when component mounts
  React.useEffect(() => {
    const fetchDownloadUrl = async () => {
      try {
        const url = await attachmentService.getDownloadUrl(attachment.filePath);
        setDownloadUrl(url);
      } catch (error) {
        console.error("Error fetching download URL:", error);
        setImageError(true);
      }
    };
    fetchDownloadUrl();
  }, [attachment.filePath]);

  if (imageError) {
    return (
      <div
        className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors bg-gray-100 dark:bg-gray-800"
        onClick={onClick}
      >
        <div className="w-full h-24 flex items-center justify-center">
          <div className="text-center">
            <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Không thể tải ảnh</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
          <p className="text-xs text-white truncate">{attachment.fileName}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
      onClick={onClick}
    >
      {downloadUrl && (
        <img
          src={downloadUrl}
          alt={attachment.fileName}
          className={`w-full h-24 object-cover transition-all duration-200 ${
            imageLoaded 
              ? 'group-hover:scale-105' 
              : 'animate-pulse bg-gray-200 dark:bg-gray-700'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Image className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
        <p className="text-xs text-white truncate">{attachment.fileName}</p>
      </div>
    </div>
  );
};

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  title = "File đính kèm",
  className = "",
}) => {
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [fullViewDownloadUrl, setFullViewDownloadUrl] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const imageAttachments = attachments.filter(att => isImageFile(att.fileType));
  const nonImageAttachments = attachments.filter(att => !isImageFile(att.fileType));

  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentService.downloadFile(attachment);
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
    }
  };

  const handleImageClick = async (attachment: Attachment) => {
    const index = imageAttachments.findIndex(img => img.id === attachment.id);
    setImageIndex(index);
    setSelectedImage(attachment);
    
    // Get download URL for full view
    try {
      const url = await attachmentService.getDownloadUrl(attachment.filePath);
      setFullViewDownloadUrl(url);
    } catch (error) {
      console.error("Error fetching download URL for full view:", error);
    }
    
    setIsFullViewOpen(true);
  };

  const handlePreviousImage = async () => {
    if (imageIndex > 0) {
      const newIndex = imageIndex - 1;
      const newImage = imageAttachments[newIndex];
      setImageIndex(newIndex);
      setSelectedImage(newImage);
      
      try {
        const url = await attachmentService.getDownloadUrl(newImage.filePath);
        setFullViewDownloadUrl(url);
      } catch (error) {
        console.error("Error fetching download URL for full view:", error);
      }
    }
  };

  const handleNextImage = async () => {
    if (imageIndex < imageAttachments.length - 1) {
      const newIndex = imageIndex + 1;
      const newImage = imageAttachments[newIndex];
      setImageIndex(newIndex);
      setSelectedImage(newImage);
      
      try {
        const url = await attachmentService.getDownloadUrl(newImage.filePath);
        setFullViewDownloadUrl(url);
      } catch (error) {
        console.error("Error fetching download URL for full view:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePreviousImage();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'Escape') {
      setIsFullViewOpen(false);
    }
  };

  return (
    <>
      <div className={`mt-3 ${className}`}>
        <div className="text-xs font-semibold mb-2 flex items-center gap-1 text-muted-foreground">
          <Paperclip className="h-3 w-3" />
          {title}:
        </div>
        
        {/* Image Previews */}
        {imageAttachments.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              Ảnh ({imageAttachments.length}):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {imageAttachments.map((attachment) => (
                <ImagePreview
                  key={attachment.id}
                  attachment={attachment}
                  onClick={() => handleImageClick(attachment)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Non-image Files */}
        {nonImageAttachments.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              File khác ({nonImageAttachments.length}):
            </div>
            <div className="space-y-2">
              {nonImageAttachments.map((file) => {
                const FileIcon = getFileIcon(file.fileType);
                return (
                  <div key={file.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-md p-2">
                    <FileIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
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
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Full View Modal */}
      <Dialog open={isFullViewOpen} onOpenChange={setIsFullViewOpen}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-0"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <DialogHeader className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <DialogTitle className="text-white text-sm font-medium truncate">
              {selectedImage?.fileName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullViewOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="relative flex items-center justify-center h-full min-h-[60vh]">
            {/* Navigation Buttons */}
            {imageAttachments.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousImage}
                  disabled={imageIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextImage}
                  disabled={imageIndex === imageAttachments.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image */}
            {selectedImage && fullViewDownloadUrl && (
              <div className="flex items-center justify-center w-full h-full p-4">
                <img
                  src={fullViewDownloadUrl}
                  alt={selectedImage.fileName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* Loading state */}
            {selectedImage && !fullViewDownloadUrl && (
              <div className="flex items-center justify-center w-full h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}

            {/* Image Counter */}
            {imageAttachments.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {imageIndex + 1} / {imageAttachments.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 