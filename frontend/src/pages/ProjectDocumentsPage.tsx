import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import documentService from "@/service/documentService";
import { toastError, toastSuccess } from "@/utils/toast";
import type { DocumentListItem } from "@/types/document";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2, FileText } from "lucide-react";

const ProjectDocumentsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
    },
  });
  
  const fetchDocuments = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await documentService.getDocumentsByProject(projectId);
      setDocuments(response.result);
    } catch (error) {
      console.error("Error:", error);
      toastError("Không thể tải danh sách tài liệu!");
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  const handleCreateDocument = async (formData: { title: string }) => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      await documentService.createDocument({
        title: formData.title,
        projectId: projectId,
        content: ""
      });
      toastSuccess("Tạo tài liệu thành công!");
      reset();
      setIsDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error:", error);
      toastError("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      try {
        await documentService.deleteDocument(documentId);
        toastSuccess("Xóa tài liệu thành công!");
        fetchDocuments();
      } catch (error) {
        toastError("Không thể xóa tài liệu!");
      }
    }
  };
  
  const handleEditDocument = (documentId: string) => {
    navigate(`/documents/${documentId}/edit`);
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tài liệu dự án</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo tài liệu mới
        </Button>
      </div>
      
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tài liệu nào</h3>
            <p className="text-gray-500 mb-4">Tạo tài liệu đầu tiên để bắt đầu</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo tài liệu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle onClick={() => handleEditDocument(doc.id)} className="text-lg truncate hover:cursor-pointer">{doc.title}</CardTitle>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {doc.creator.name || doc.creator.email}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditDocument(doc.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo tài liệu mới</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleCreateDocument)} className="space-y-4">
            <div>
              <Label htmlFor="title">Tên tài liệu</Label>
              <Input
                id="title"
                {...register("title", { required: "Tên tài liệu là bắt buộc" })}
                placeholder="Nhập tên tài liệu"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo tài liệu"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDocumentsPage;