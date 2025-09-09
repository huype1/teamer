/**
 * Invitation utility functions for handling pending invitations
 * after user authentication (login/signup)
 */

import { acceptProjectInvitation } from "@/service/projectService";

/**
 * Processes any pending invitation token stored in localStorage
 * This should be called after successful user authentication
 */
export const processPendingInvitation = async (): Promise<{ success: boolean; projectId?: string }> => {
  const token = localStorage.getItem('pendingInvitationToken');
  
  if (!token) {
    return { success: false }; // No pending invitation
  }

  try {
    const response = await acceptProjectInvitation(token);
    localStorage.removeItem('pendingInvitationToken');
    
    // Extract project ID from response if available
    const projectId = response.result?.projectId || response.result?.id;
    
    return { success: true, projectId };
  } catch (error) {
    console.error('Error processing invitation:', error);
    localStorage.removeItem('pendingInvitationToken');
    return { success: false };
  }
};

/**
 * Checks if there's a pending invitation token
 */
export const hasPendingInvitation = (): boolean => {
  return !!localStorage.getItem('pendingInvitationToken');
};

/**
 * Clears any pending invitation token
 */
export const clearPendingInvitation = (): void => {
  localStorage.removeItem('pendingInvitationToken');
};

/**
 * Navigate to invitation page if there's a pending token
 */
export const navigateToPendingInvitation = (): boolean => {
  const token = localStorage.getItem('pendingInvitationToken');
  if (token) {
    window.location.href = `/invitation/accept_invitation?token=${token}`;
    return true;
  }
  return false;
}; 