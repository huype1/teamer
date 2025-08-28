import type { User } from "@/types/user";
import type { ProjectMember } from "@/types/project";

/**
 * Helper function: Kiểm tra quyền edit - chỉ creator mới được edit
 * @param user - User hiện tại
 * @param creatorId - ID của người tạo item
 * @returns boolean - true nếu user có quyền edit
 */
export const canEditItem = (user: User | null, creatorId?: string): boolean => {
  if (!user || !creatorId) return false;
  return user.id === creatorId;
};

/**
 * Helper function: Kiểm tra quyền create - không cho VIEWER role
 * @param user - User hiện tại
 * @param projectId - ID của project
 * @returns boolean - true nếu user có quyền create
 */
export const canCreateItem = (user: User | null, projectId?: string): boolean => {
  if (!user || !projectId) return false;
  
  // Tìm thông tin user trong project
  const currentUserMember = user.projectMembers?.find(m => m.projectId === projectId);
  
  // Không cho VIEWER role tạo item
  return !!(currentUserMember && currentUserMember.role !== "VIEWER");
};

/**
 * Helper function: Lấy thông tin user hiện tại trong project
 * @param user - User hiện tại
 * @param projectId - ID của project
 * @returns ProjectMember | null
 */
export const getCurrentUserProjectMember = (user: User | null, projectId?: string): ProjectMember | null => {
  if (!user || !projectId) return null;
  return user.projectMembers?.find(m => m.projectId === projectId) || null;
};

/**
 * Helper function: Kiểm tra quyền quản lý - chỉ ADMIN và PM
 * @param user - User hiện tại
 * @param projectId - ID của project
 * @returns boolean - true nếu user có quyền quản lý
 */
export const canManageProject = (user: User | null, projectId?: string): boolean => {
  if (!user || !projectId) return false;
  const currentUserMember = getCurrentUserProjectMember(user, projectId);
  return !!(currentUserMember && (currentUserMember.role === "ADMIN" || currentUserMember.role === "PM"));
};

/**
 * Helper function: Kiểm tra quyền edit document - creator hoặc ADMIN/PM
 * @param user - User hiện tại
 * @param creatorId - ID của người tạo document
 * @param projectId - ID của project
 * @returns boolean - true nếu user có quyền edit document
 */
export const canEditDocument = (user: User | null, creatorId?: string, projectId?: string): boolean => {
  if (!user || !creatorId || !projectId) return false;
  
  // Creator luôn có quyền edit
  if (user.id === creatorId) return true;
  
  // ADMIN và PM cũng có quyền edit
  return canManageProject(user, projectId);
}; 