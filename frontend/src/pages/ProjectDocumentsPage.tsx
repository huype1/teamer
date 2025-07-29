import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import documentService from "@/service/documentService";
import { toastError, toastSuccess } from "@/utils/toast";
import type { DocumentListItem } from "@/types/document";
import { Plus, Edit, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const ProjectDocumentsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  
  const fetchDocuments = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await documentService.getDocumentsByProjectId(projectId);
      setDocuments(response.result);
    } catch (error) {
      console.error("Error:", error);
      toastError("Không thể tải tài liệu!");
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    
    try {
      setLoading(true);
      await documentService.createDocument({
        ...formData,
        projectId
      });
      toastSuccess("Tạo tài liệu thành công!");
      setFormData({ name: "", description: "" });
      setIsDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error:", error);
      toastError("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
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
        <LoadingSpinner text="Đang tải..." />
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
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{document.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {document.description || "Không có mô tả"}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Tạo bởi: {document.creator.name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDocument(document.id)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Tên tài liệu</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên tài liệu"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả tài liệu"
                rows={3}
              />
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