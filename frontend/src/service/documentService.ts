import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { Document, DocumentCreationRequest, DocumentUpdateRequest } from "@/types/document";

const baseUrl = "http://localhost:8080/api/documents";

// Get documents by project (without content for performance)
export const getDocumentsByProject = async (projectId: string) => {
  const res = await axios.get(`${baseUrl}/project/${projectId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Get specific document with full content
export const getDocumentById = async (documentId: string) => {
  const res = await axios.get(`${baseUrl}/${documentId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Create new document
export const createDocument = async (body: DocumentCreationRequest) => {
  const res = await axios.post(baseUrl, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Update document
export const updateDocument = async (documentId: string, body: DocumentUpdateRequest) => {
  const res = await axios.put(`${baseUrl}/${documentId}`, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Delete document
export const deleteDocument = async (documentId: string) => {
  const res = await axios.delete(`${baseUrl}/${documentId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export default {
  getDocumentsByProject,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
};