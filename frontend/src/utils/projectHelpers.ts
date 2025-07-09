import type { User } from '@/types/user';

// Helper function để lấy role của user hiện tại trong project
export const getCurrentUserRole = (user: User | null, projectId: string, teamId?: string): string | null => {
  if (!user || !projectId) return null;
  const projectMember = user.projectMembers.find(pm => pm.projectId === projectId);
  return projectMember?.role || null;
};

// Helper function để kiểm tra user có phải là ADMIN không
export const isCurrentUserAdmin = (user: User | null, projectId: string): boolean => {
  return getCurrentUserRole(user, projectId) === "ADMIN";
};

// Helper function để kiểm tra user có phải là PM hoặc ADMIN không
export const isCurrentUserManager = (user: User | null, projectId: string): boolean => {
  const role = getCurrentUserRole(user, projectId);
  return role === "ADMIN" || role === "PM";
};

// Helper function để kiểm tra user có thể quản lý thành viên không (chỉ ADMIN)
export const canManageMembers = (user: User | null, projectId: string, projectCreatorId?: string): boolean => {
  if (!user || !projectId) return false;
  return (
    projectCreatorId === user.id ||
    isCurrentUserAdmin(user, projectId)
  );
};

// Helper function để kiểm tra user có thể mời thành viên không (chỉ ADMIN)
export const canInviteMembers = (user: User | null, projectId: string): boolean => {
  return isCurrentUserAdmin(user, projectId);
};

// Helper function để kiểm tra user có thể cập nhật vai trò không (chỉ ADMIN)
export const canUpdateRoles = (user: User | null, projectId: string): boolean => {
  return isCurrentUserAdmin(user, projectId);
}; 