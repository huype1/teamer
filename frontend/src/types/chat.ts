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
  sender: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatMessageRequest {
  content: string;
  chatId: string;
} 