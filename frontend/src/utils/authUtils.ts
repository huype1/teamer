import { store } from "@/store";
import { refreshUserInfo } from "@/store/authReducer";

/**
 * Refresh user info after creating project/team to update permissions
 * This ensures the user has the latest projectMembers and teamMembers data
 */
export const refreshUserInfoAfterCreation = async () => {
  try {
    await store.dispatch(refreshUserInfo());
    console.log("User info refreshed successfully after creation");
  } catch (error) {
    console.error("Failed to refresh user info after creation:", error);
    // Don't throw error as this is not critical
  }
};

/**
 * Check if user has permission for a specific project
 */
export const hasProjectPermission = (projectId: string, user: any) => {
  if (!user?.projectMembers) return false;
  return user.projectMembers.some((member: any) => member.projectId === projectId);
};

/**
 * Check if user has admin permission for a specific project
 */
export const hasProjectAdminPermission = (projectId: string, user: any) => {
  if (!user?.projectMembers) return false;
  return user.projectMembers.some((member: any) => 
    member.projectId === projectId && member.role === 'ADMIN'
  );
};

/**
 * Check if user has permission for a specific team
 */
export const hasTeamPermission = (teamId: string, user: any) => {
  if (!user?.teamMembers) return false;
  return user.teamMembers.some((member: any) => member.teamId === teamId);
};

/**
 * Check if user has admin permission for a specific team
 */
export const hasTeamAdminPermission = (teamId: string, user: any) => {
  if (!user?.teamMembers) return false;
  return user.teamMembers.some((member: any) => 
    member.teamId === teamId && member.role === 'ADMIN'
  );
};

