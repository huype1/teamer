import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Upload, 
  Download, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Plus,
  Calendar,
  User,
  Search,
  MoreHorizontal
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import ProjectService from "@/service/projectService";
import attachmentService, { type Attachment } from "@/service/attachmentService";
import documentService from "@/service/documentService";
import { toastSuccess, toastError } from "@/utils/toast";
import type { Document } from "@/types/document";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectNavigation from "@/components/project/ProjectNavigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
}

const ProjectDocumentsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [project, setProject] = useState<Project | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateDocumentDialogOpen, setIsCreateDocumentDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [canUpload, setCanUpload] = useState(false);
  
  // Document creation state
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [creatingDocument, setCreatingDocument] = useState(false);
  
  // Document edit state
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isEditDocumentDialogOpen, setIsEditDocumentDialogOpen] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch project, attachments and documents
  const fetchData = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const [projectRes, attachmentsRes, documentsRes] = await Promise.all([
        ProjectService.getProjectById(projectId),
        attachmentService.getAllAttachmentsByProjectId(projectId),
        documentService.getDocumentsByProject(projectId)
      ]);
      
      setProject(projectRes.result);
      setAttachments(attachmentsRes || []);
      setDocuments(documentsRes.result || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toastError("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if user can upload files
  useEffect(() => {
    if (!user || !project) {
      setCanUpload(false);
      return;
    }
    
    // Check if user is project member with appropriate role
    const userMember = user.projectMembers?.find(m => m.projectId === projectId);
    setCanUpload(!!(userMember && (userMember.role === "ADMIN" || userMember.role === "PM")));
  }, [user, project, projectId]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploading(true);
      
      for (const file of selectedFiles) {
        try {
          // Upload file to S3
          const metadata = await attachmentService.uploadFile(file);
          
          // Create attachment record in database with project_id
          await attachmentService.createAttachment({
            fileName: metadata.fileName,
            fileType: metadata.fileType,
            fileSize: metadata.fileSize,
            filePath: metadata.filePath,
            projectId: projectId!,
          });
          
          toastSuccess(`Tải lên ${file.name} thành công!`);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toastError(`Lỗi khi tải lên ${file.name}!`);
        }
      }
      
      // Refresh attachments list
      await fetchData();
      
      // Reset form
      setSelectedFiles([]);
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error("Upload error:", error);
      toastError("Có lỗi xảy ra khi tải lên!");
    } finally {
      setUploading(false);
    }
  };

  // Handle document creation
  const handleCreateDocument = async () => {
    if (!documentTitle.trim()) {
      toastError("Vui lòng nhập tên tài liệu!");
      return;
    }
    
    try {
      setCreatingDocument(true);
      
      await documentService.createDocument({
        title: documentTitle.trim(),
        projectId: projectId!,
        content: JSON.stringify({ ops: [{ insert: '\n' }] }) // Empty Quill content
      });
      
      toastSuccess("Tạo tài liệu mới thành công!");
      setDocumentTitle("");
      setDocumentDescription("");
      setIsCreateDocumentDialogOpen(false);
      
      // Refresh documents list
      await fetchData();
    } catch (error) {
      console.error("Error creating document:", error);
      toastError("Tạo tài liệu thất bại!");
    } finally {
      setCreatingDocument(false);
    }
  };

  // Handle document edit
  const handleEditDocument = async (document: Document) => {
    setEditingDocument(document);
    setDocumentTitle(document.title);
    setIsEditDocumentDialogOpen(true);
  };

  // Handle document update
  const handleUpdateDocument = async () => {
    if (!editingDocument || !documentTitle.trim()) {
      toastError("Vui lòng nhập tên tài liệu!");
      return;
    }
    
    try {
      setCreatingDocument(true);
      
      await documentService.updateDocument(editingDocument.id, {
        title: documentTitle.trim(),
        content: editingDocument.content
      });
      
      toastSuccess("Cập nhật tài liệu thành công!");
      setDocumentTitle("");
      setIsEditDocumentDialogOpen(false);
      setEditingDocument(null);
      
      // Refresh documents list
      await fetchData();
    } catch (error) {
      console.error("Error updating document:", error);
      toastError("Cập nhật tài liệu thất bại!");
    } finally {
      setCreatingDocument(false);
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      return;
    }
    
    try {
      setDeletingDocument(documentId);
      await documentService.deleteDocument(documentId);
      toastSuccess("Xóa tài liệu thành công!");
      
      // Refresh documents list
      await fetchData();
    } catch (error) {
      console.error("Error deleting document:", error);
      toastError("Xóa tài liệu thất bại!");
    } finally {
      setDeletingDocument(null);
    }
  };

  // Handle document view
  const handleViewDocument = (document: Document) => {
    // Navigate to document editor page
    navigate(`/documents/${document.id}/edit`);
  };

  // Handle file download
  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentService.downloadFile(attachment);
    } catch (error) {
      console.error("Download error:", error);
      toastError("Không thể tải xuống file!");
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <Archive className="h-4 w-4" />;
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter attachments based on search term
  const filteredAttachments = attachments.filter(attachment =>
    attachment.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAttachments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAttachments = filteredAttachments.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ProjectHeader 
          title={`${project?.name || 'Dự án'} - Tài liệu`}
          showBackButton
        />
        <ProjectNavigation projectId={projectId!} activeTab="documents" />
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
          <span className="ml-2">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <ProjectHeader 
          title="Dự án - Tài liệu"
          showBackButton
        />
        <ProjectNavigation projectId={projectId!} activeTab="documents" />
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            Không tìm thấy dự án
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProjectHeader 
        title={`${project?.name} - Tài liệu`}
        showBackButton
      />
      <ProjectNavigation projectId={projectId!} activeTab="documents" />

      <div className="p-6 space-y-8">
        {/* Section 1: File Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Quản lý tệp đính kèm</h2>
              <p className="text-sm text-muted-foreground">
                Tải lên và quản lý các file đính kèm của dự án
              </p>
            </div>
            
            {canUpload && (
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tải lên tệp
              </Button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tệp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Attachments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentAttachments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {searchTerm ? 'Không tìm thấy tệp nào' : 'Chưa có tệp nào'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách tải lên tệp đầu tiên'}
                </p>
                {canUpload && !searchTerm && (
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Tải lên tệp
                  </Button>
                )}
              </div>
            ) : (
              currentAttachments.map((attachment) => (
                <Card key={attachment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(attachment.fileType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={attachment.fileName}>
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        <span className="truncate">{attachment?.uploader?.name ?? "undefined uploader"}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(attachment?.uploadedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(attachment)}
                        className="w-full"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Tải xuống
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </div>

                  {/* Section 2: Document Management */}
          <div className="space-y-4 border-t pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Quản lý tài liệu</h2>
                <p className="text-sm text-muted-foreground">
                  Tạo và quản lý các tài liệu viết bằng trình soạn thảo
                </p>
              </div>
              
              {canUpload && (
                <Button onClick={() => setIsCreateDocumentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo tài liệu mới
                </Button>
              )}
            </div>

          {/* Documents List */}
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate mb-2">
                          {document?.title}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground space-x-4">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {document?.creator?.name || "Unknown"}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(document?.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end mt-4 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDocument(document)}
                        className="h-8 px-2 mr-2"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Xem
                      </Button>
                      
                      {canUpload && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditDocument(document)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDocument(document.id)}
                              disabled={deletingDocument === document.id}
                              className="text-red-600 focus:text-red-600"
                            >
                              {deletingDocument === document.id ? (
                                <LoadingSpinner className="h-4 w-4 mr-2" />
                              ) : (
                                <FileText className="h-4 w-4 mr-2" />
                              )}
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có tài liệu nào</p>
              <p className="text-sm">Tạo tài liệu đầu tiên để bắt đầu</p>
            </div>
          )}
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tải lên tệp</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="files">Chọn file</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept="*/*"
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bạn có thể chọn nhiều file cùng lúc
                </p>
              </div>
              
              {selectedFiles.length > 0 && (
                <div>
                  <Label>File đã chọn:</Label>
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate">{file.name}</span>
                        <span className="text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
                disabled={uploading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Tải lên
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Document Dialog */}
        <Dialog open={isCreateDocumentDialogOpen} onOpenChange={setIsCreateDocumentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo tài liệu mới</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="documentTitle">Tên tài liệu *</Label>
                <Input
                  id="documentTitle"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Nhập tên tài liệu"
                  disabled={creatingDocument}
                />
              </div>
              
              <div>
                <Label htmlFor="documentDescription">Mô tả</Label>
                <Textarea
                  id="documentDescription"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Nhập mô tả tài liệu (tùy chọn)"
                  rows={3}
                  disabled={creatingDocument}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDocumentDialogOpen(false)}
                disabled={creatingDocument}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateDocument}
                disabled={!documentTitle.trim() || creatingDocument}
              >
                {creatingDocument ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo tài liệu
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Document Dialog */}
        <Dialog open={isEditDocumentDialogOpen} onOpenChange={setIsEditDocumentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa tài liệu</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="editDocumentTitle">Tên tài liệu *</Label>
                <Input
                  id="editDocumentTitle"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Nhập tên tài liệu"
                  disabled={creatingDocument}
                />
              </div>
              

            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDocumentDialogOpen(false);
                  setEditingDocument(null);
                  setDocumentTitle("");
                }}
                disabled={creatingDocument}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdateDocument}
                disabled={!documentTitle.trim() || creatingDocument}
              >
                {creatingDocument ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Cập nhật
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectDocumentsPage;