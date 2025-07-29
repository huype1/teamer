import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Quill from "quill";
import hljs from "highlight.js";
import "quill/dist/quill.snow.css";
import "highlight.js/styles/github.css";

import { Button } from "@/components/ui/button";
import { toastError } from "@/utils/toast";
import documentService from "@/service/documentService";
import type { Document } from "@/types/document";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const SAVE_INTERVAL_MS = 3000;
const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  ["link", "image", "video"],

  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],

  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  // [{ align: [] }],
  [["code-block"]],
  ["clean"]
];

const DocumentEditorPage = () => {
  const [quill, setQuill] = useState<Quill | null>(null);
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  // Load document
  useEffect(() => {
    if (!documentId) return;

    const loadDocument = async () => {
      try {
        setLoading(true);
        const response = await documentService.getDocumentById(documentId);
        setDocumentData(response.result);
      } catch (error) {
        console.error("Error loading document:", error);
        toastError("Không thể tải tài liệu!");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId, navigate]);

  // Auto-save functionality
  useEffect(() => {
    if (!quill || !documentId) return;

    const interval = setInterval(async () => {
      try {
        setSaving(true);
        const content = quill.getContents();
        await documentService.updateDocument(documentId, {
          content: JSON.stringify(content)
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
        toastError("Lưu tự động thất bại!");
      } finally {
        setSaving(false);
      }
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [quill, documentId]);

  // Initialize Quill editor
  const wrapperRef = useCallback((wrapper: HTMLDivElement | null) => {
    if (wrapper === null) return;
    
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    
    const q = new Quill(editor, {
      theme: "snow",
      modules: { 
        toolbar: TOOLBAR_OPTIONS, 
        syntax: { hljs } 
      },
    });

    setQuill(q);
  }, []);

  // Set document content when both quill and document are ready
  useEffect(() => {
    if (!quill || !documentData) return;

    try {
      if (documentData.content) {
        const content = JSON.parse(documentData.content);
        quill.setContents(content);
      }
    } catch (error) {
      console.error("Error parsing document content:", error);
    }
  }, [quill, documentData]);

  // Manual save function
  const handleSave = async () => {
    if (!quill || !documentId) return;

    try {
      setSaving(true);
      const content = quill.getContents();
      await documentService.updateDocument(documentId, {
        content: JSON.stringify(content)
      });
    } catch (error) {
      console.error("Save failed:", error);
      toastError("Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner text="Đang tải tài liệu..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
     
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {documentData?.title || "Untitled"}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {saving ? "Đang lưu..." : "Đã lưu thay đổi"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              variant="ghost"
              size="sm"
              className="hover:cursor-pointer bg-primary text-white"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button 
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="hover:cursor-pointer"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div id="container" ref={wrapperRef} className="quill-editor-container"></div>
      </div>

       <style dangerouslySetInnerHTML={{
        __html: `
          .quill-editor-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 24px;
          }
          
          .quill-editor-container .ql-toolbar.ql-snow {
            border: none;
            background: white;
            padding: 12px 0;
            z-index: 40;
          }
          
          .dark .quill-editor-container .ql-toolbar.ql-snow {
            background: #111827;
            color: #f9fafb;
          }
          
          .quill-editor-container .ql-container.ql-snow {
            border: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
          }
          
          .quill-editor-container .ql-editor {
            padding: 0;
            min-height: calc(100vh - 200px);
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
          }
          
          .dark .quill-editor-container .ql-editor {
            color: #d1d5db;
          }
          
          .quill-editor-container .ql-editor h1 {
            font-size: 2em;
            font-weight: 600;
            margin: 1.5em 0 0.5em 0;
            color: #111827;
          }
          
          .dark .quill-editor-container .ql-editor h1 {
            color: #f9fafb;
          }
          
          .quill-editor-container .ql-editor h2 {
            font-size: 1.5em;
            font-weight: 600;
            margin: 1.2em 0 0.4em 0;
            color: #111827;
          }
          
          .dark .quill-editor-container .ql-editor h2 {
            color: #f9fafb;
          }
          
          .quill-editor-container .ql-editor h3 {
            font-size: 1.25em;
            font-weight: 600;
            margin: 1em 0 0.3em 0;
            color: #111827;
          }
          
          .dark .quill-editor-container .ql-editor h3 {
            color: #f9fafb;
          }
          
          .quill-editor-container .ql-editor p {
            margin: 0.5em 0;
          }
          
          .quill-editor-container .ql-editor blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 1em 0;
            padding-left: 1em;
            color: #6b7280;
          }
          
          .dark .quill-editor-container .ql-editor blockquote {
            border-left-color: #4b5563;
            color: #9ca3af;
          }
          
          .quill-editor-container .ql-editor code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace;
            font-size: 0.9em;
          }
          
          .dark .quill-editor-container .ql-editor code {
            background: #374151;
            color: #e5e7eb;
          }
          
          .quill-editor-container .ql-editor pre {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 1em;
            margin: 1em 0;
            overflow-x: auto;
          }
          
          .dark .quill-editor-container .ql-editor pre {
            background: #1f2937;
            border-color: #4b5563;
            color: #e5e7eb;
          }
          
          .quill-editor-container .ql-editor ul,
          .quill-editor-container .ql-editor ol {
            margin: 0.5em 0;
            padding-left: 1.5em;
          }
          
          .quill-editor-container .ql-editor li {
            margin: 0.2em 0;
          }
          
          .quill-editor-container .ql-editor a {
            color: #2563eb;
            text-decoration: underline;
          }
          
          .quill-editor-container .ql-editor a:hover {
            color: #1d4ed8;
          }
          
          .dark .quill-editor-container .ql-editor a {
            color: #60a5fa;
          }
          
          .dark .quill-editor-container .ql-editor a:hover {
            color: #93c5fd;
          }
          
          .quill-editor-container .ql-editor:focus {
            outline: none;
          }
          
          /* Dark mode for toolbar buttons */
          .dark .quill-editor-container .ql-toolbar button {
            color: #f9fafb;
          }
          
          .dark .quill-editor-container .ql-toolbar button:hover {
            color: #60a5fa;
          }
          
          .dark .quill-editor-container .ql-toolbar .ql-active {
            color: #60a5fa;
          }
          
          .dark .quill-editor-container .ql-toolbar .ql-stroke {
            stroke: #f9fafb;
          }
          
          .dark .quill-editor-container .ql-toolbar .ql-fill {
            fill: #f9fafb;
          }
          
          @media (max-width: 768px) {
            .quill-editor-container {
              padding: 0 16px;
            }
            
            .quill-editor-container .ql-editor {
              font-size: 15px;
            }
          }
        `
      }} />
    </div>
  );
};

export default DocumentEditorPage;