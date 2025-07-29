import axios from "axios";
import addReqToken from "@/utils/addReqToken";

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
}

// Get chat by ID
export const getChatById = async (chatId: string) => {
  const res = await axios.get(`${baseUrl}/${chatId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Get all messages for a chat
export const getAllChatMessages = async (chatId: string) => {
  const res = await axios.get(`${baseUrl}/${chatId}/messages/all`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Create new message
export const createChatMessage = async (messageData: CreateChatMessageRequest) => {
  const res = await axios.post(`${baseUrl}/messages`, messageData, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Delete message
export const deleteChatMessage = async (messageId: string) => {
  const res = await axios.delete(`${baseUrl}/messages/${messageId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export default {
  getChatById,
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
}; 