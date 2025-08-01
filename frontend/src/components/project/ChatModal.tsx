import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Send, MessageSquare, Paperclip } from "lucide-react";
import { toastError } from "@/utils/toast";
import chatService, { type ChatMessage } from "@/service/chatService";
import attachmentService, { type Attachment, type AttachmentMeta } from "@/service/attachmentService";
import { AttachmentList } from "@/components/ui/attachment-list";
import websocketService, { type AttachmentInfo } from "@/service/websocketService";
import { useWebSocketContext } from "@/components/WebSocketProvider";
import type { RootState } from "@/store";
import { LoadingSpinner } from "../ui/loading-spinner";

const messageSchema = z.object({
  content: z.string().min(1, "Tin nhắn không được để trống"),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatName: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, chatId, chatName }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isConnected } = useWebSocketContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [messageAttachments, setMessageAttachments] = useState<Record<string, Attachment[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket chat message handling
  useEffect(() => {
    if (chatId && isOpen && isConnected) {
      const handleChatMessage = async (message: { type: string; messageId?: string; content?: string; chatId?: string; senderId?: string; senderName?: string; senderEmail?: string; senderAvatarUrl?: string; createdAt?: string; updatedAt?: string; attachments?: AttachmentInfo[] }) => {
        if (message.type === 'CREATE') {
          const newMessage: ChatMessage = {
            id: message.messageId || '',
            content: message.content || '',
            chatId: message.chatId || '',
            createdAt: message.createdAt || new Date().toISOString(),
            updatedAt: message.updatedAt || new Date().toISOString(),
            sender: {
              id: message.senderId || '',
              name: message.senderName || '',
              email: message.senderEmail || '',
              avatarUrl: message.senderAvatarUrl || '',
            },
          };
          setMessages(prev => [...prev, newMessage]);
          
          // Handle attachments from WebSocket
          if (message.attachments && message.attachments.length > 0) {
            const attachmentList = message.attachments.map((att: AttachmentInfo) => ({
              id: att.id,
              fileName: att.fileName,
              fileType: att.fileType,
              fileSize: att.fileSize,
              filePath: att.filePath,
              uploadedAt: new Date().toISOString(),
              uploader: {
                id: message.senderId || '',
                name: message.senderName || '',
                email: message.senderEmail || '',
              },
            }));
            setMessageAttachments(prev => ({
              ...prev,
              [message.messageId || '']: attachmentList
            }));
          }
        } else if (message.type === 'UPDATE') {
          setMessages(prev => prev.map(msg => 
            msg.id === message.messageId 
              ? { ...msg, content: message.content || '', updatedAt: message.updatedAt || new Date().toISOString() }
              : msg
          ));
          
          // Update attachments if provided
          if (message.attachments) {
            const attachmentList = message.attachments.map((att: AttachmentInfo) => ({
              id: att.id,
              fileName: att.fileName,
              fileType: att.fileType,
              fileSize: att.fileSize,
              filePath: att.filePath,
              uploadedAt: new Date().toISOString(),
              uploader: {
                id: message.senderId || '',
                name: message.senderName || '',
                email: message.senderEmail || '',
              },
            }));
            setMessageAttachments(prev => ({
              ...prev,
              [message.messageId || '']: attachmentList
            }));
          }
        } else if (message.type === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== message.messageId));
          // Remove attachments for deleted message
          setMessageAttachments(prev => {
            const newAttachments = { ...prev };
            delete newAttachments[message.messageId || ''];
            return newAttachments;
          });
        }
      };
      
      websocketService.subscribeToChatMessages(chatId, handleChatMessage);
      
      // Cleanup function
      return () => {
        websocketService.unsubscribeFromChatMessages(chatId);
      };
    }
  }, [chatId, isOpen, isConnected]);

  useEffect(() => {
    if (chatId && isOpen) {
      fetchMessages();
    }
  }, [chatId, isOpen]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await chatService.getAllChatMessages(chatId);
      setMessages(messagesData.result || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toastError("Không thể tải tin nhắn!");
    } finally {
      setLoading(false);
    }
  };

  // Upload files to S3 and get metadata
  const uploadFilesToS3 = async (files: File[]) => {
    setUploading(true);
    const uploaded: AttachmentMeta[] = [];
    for (const file of files) {
      try {
        const attachmentMeta = await attachmentService.uploadFile(file);
        uploaded.push(attachmentMeta);
      } catch (error) {
        console.error("Lỗi khi upload file:", error);
        toastError(`Không thể upload file ${file.name}`);
      }
    }
    setUploading(false);
    return uploaded;
  };

  // Fetch attachments for messages
  const fetchAttachmentsForMessages = async (messages: ChatMessage[]) => {
    const result: Record<string, Attachment[]> = {};
    for (const msg of messages) {
      try {
        const res = await attachmentService.getByMessageId(msg.id);
        result[msg.id] = res;
      } catch {
        result[msg.id] = [];
      }
    }
    setMessageAttachments(result);
  };

  // Fetch attachments when messages change
  useEffect(() => {
    if (messages.length > 0) {
      fetchAttachmentsForMessages(messages);
    }
  }, [messages]);

  const onSubmitMessage = async (data: MessageFormData) => {
    if (!user) return;
    
    let attachments: AttachmentMeta[] = [];
    if (selectedFiles.length > 0) {
      attachments = await uploadFilesToS3(selectedFiles);
    }
    
    try {
      await chatService.createChatMessage({
        content: data.content,
        chatId: chatId,
        attachments: attachments,
      });
      reset();
      setSelectedFiles([]);
    } catch (error) {
      toastError("Gửi tin nhắn thất bại!");
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteChatMessage(messageId);
    } catch (error) {
      toastError("Xóa tin nhắn thất bại!");
      console.error("Error deleting message:", error);
    }
  };

  // Format date for display
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  // File upload component
  function FileUploadInput({
    selectedFiles,
    setSelectedFiles,
    uploading
  }: {
    selectedFiles: File[];
    setSelectedFiles: (files: File[]) => void;
    uploading: boolean;
  }) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedFiles(Array.from(e.target.files || []));
    };

    const removeFile = (index: number) => {
      setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    return (
      <div className="mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Paperclip className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">Đính kèm file</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        {selectedFiles.length > 0 && (
          <ul className="mt-2 space-y-1">
            {selectedFiles.map((file, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm bg-muted rounded px-2 py-1">
                <span className="truncate max-w-xs">{file.name}</span>
                <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeFile(idx)}
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {uploading && <div className="text-xs text-blue-500 mt-1">Đang upload file...</div>}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {chatName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
          >
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Chưa có tin nhắn nào</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={message.sender.avatarUrl} />
                      <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-sm truncate">{message.sender.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                        {user && message.sender.id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm break-words">{message.content}</div>
                      {/* Display attachments */}
                      <AttachmentList attachments={messageAttachments[message.id] || []} />
                    </div>
                  </div>
                ))}
                {/* Invisible div for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit(onSubmitMessage)} className="space-y-2">
              <Textarea
                placeholder="Nhập tin nhắn..."
                {...register("content")}
                rows={3}
                className="resize-none"
              />
              <FileUploadInput
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                uploading={uploading}
              />
              {errors.content && (
                <span className="text-xs text-red-500">{errors.content.message}</span>
              )}
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={isSubmitting || uploading}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting || uploading ? "Đang gửi..." : "Gửi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal; 