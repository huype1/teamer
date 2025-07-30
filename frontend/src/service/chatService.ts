import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { AttachmentMeta } from "./attachmentService";

const baseUrl = "http://localhost:8080/api/chats";

export interface Chat {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  chatId: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateChatMessageRequest {
  content: string;
  chatId: string;
  attachments?: AttachmentMeta[];
}

// Get all chats
export const getAllChats = async (): Promise<Chat[]> => {
  const res = await axios.get(baseUrl, addReqToken(localStorage.getItem("token")));
  return res.data.result;
};

// Get chat by ID
export const getChatById = async (chatId: string): Promise<Chat> => {
  const res = await axios.get(`${baseUrl}/${chatId}`, addReqToken(localStorage.getItem("token")));
  return res.data.result;
};

// Get all messages for a chat
export const getAllChatMessages = async (chatId: string): Promise<{ result: ChatMessage[] }> => {
  const res = await axios.get(`${baseUrl}/${chatId}/messages/all`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Create a new message
export const createChatMessage = async (request: CreateChatMessageRequest): Promise<ChatMessage> => {
  const res = await axios.post(`${baseUrl}/messages`, request, addReqToken(localStorage.getItem("token")));
  return res.data.result;
};

// Delete a message
export const deleteChatMessage = async (messageId: string): Promise<void> => {
  await axios.delete(`${baseUrl}/messages/${messageId}`, addReqToken(localStorage.getItem("token")));
};

// Get messages with pagination (for future use)
export const getChatMessages = async (chatId: string, page: number = 0, size: number = 20): Promise<{ result: ChatMessage[] }> => {
  const res = await axios.get(`${baseUrl}/${chatId}/messages?page=${page}&size=${size}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export default {
  getAllChats,
  getChatById,
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
  getChatMessages,
}; 