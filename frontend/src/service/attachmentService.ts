import axios from "axios";
import { config } from "@/config/env";
import addReqToken from "@/utils/addReqToken";
import type { AttachmentMeta } from "@/types/attachment";

const baseUrl = `${config.getApiBaseUrl()}/attachments`;

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

// Get presigned URL for upload
export const getPresignedUrl = async (fileName: string, fileType: string) => {
  const res = await axios.post(
    `${baseUrl}/presigned-url`,
    { fileName, fileType },
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

// Get download URL for file
export const getDownloadUrl = async (filePath: string) => {
  const res = await axios.post(
    `${baseUrl}/download-url`,
    { filePath },
    addReqToken(localStorage.getItem("token"))
  );
  return res.data.downloadUrl;
};

// Get download URL for file (sync version for direct use in components)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDownloadUrlSync = (filePath: string) => {
  // For now, we'll construct the URL directly since we know the pattern
  // In production, you might want to cache presigned URLs or use a different approach
  return `${baseUrl}/download-url`;
};

// Upload file to S3 using presigned URL
export const uploadFileToS3 = async (file: File, presignedUrl: string) => {
  await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
};

// Complete upload process: get presigned URL, upload to S3, return metadata
export const uploadFile = async (file: File): Promise<AttachmentMeta> => {
  // 1. Get presigned URL
  const { url, filePath } = await getPresignedUrl(file.name, file.type);
  
  // 2. Upload to S3
  await uploadFileToS3(file, url);
  
  // 3. Return metadata
  return {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    filePath,
  };
};

// Get attachments by comment ID
export const getByCommentId = async (commentId: string): Promise<Attachment[]> => {
  const res = await axios.get(
    `${baseUrl}/comment/${commentId}`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

// Get attachments by issue ID
export const getByIssueId = async (issueId: string): Promise<Attachment[]> => {
  const res = await axios.get(
    `${baseUrl}/issue/${issueId}`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

// Get attachments by message ID
export const getByMessageId = async (messageId: string): Promise<Attachment[]> => {
  const res = await axios.get(
    `${baseUrl}/message/${messageId}`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

// Get all attachments by project ID
export const getAllAttachmentsByProjectId = async (projectId: string): Promise<Attachment[]> => {
  const res = await axios.get(
    `${baseUrl}/project/${projectId}`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

// Download file
export const downloadFile = async (attachment: Attachment) => {
  const downloadUrl = await getDownloadUrl(attachment.filePath);
  
  // Create a temporary link and trigger download
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Create attachment record in database
export const createAttachment = async (attachmentData: {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  projectId?: string;
  issueId?: string;
  commentId?: string;
  messageId?: string;
  uploaderId?: string; // Add uploader ID
}): Promise<Attachment> => {
  const res = await axios.post(
    `${baseUrl}`,
    attachmentData,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data.result;
};

// Upload file with automatic attachment creation
export const uploadFileWithAttachment = async (
  file: File, 
  options: {
    projectId?: string;
    issueId?: string;
    commentId?: string;
    messageId?: string;
    uploaderId?: string;
  }
): Promise<Attachment> => {
  // 1. Upload file to S3
  const metadata = await uploadFile(file);
  
  // 2. Create attachment record in database
  const attachment = await createAttachment({
    ...metadata,
    ...options,
  });
  
  return attachment;
};

// Delete attachment
export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  await axios.delete(
    `${baseUrl}/${attachmentId}`,
    addReqToken(localStorage.getItem("token"))
  );
};

export default {
  getPresignedUrl,
  getDownloadUrl,
  uploadFileToS3,
  uploadFile,
  getByCommentId,
  getByIssueId,
  getByMessageId,
  getAllAttachmentsByProjectId,
  createAttachment,
  uploadFileWithAttachment,
  deleteAttachment,
  downloadFile,
}; 