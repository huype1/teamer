/**
 * Invitation utility functions for handling pending invitations
 * after user authentication (login/signup)
 */

import { acceptProjectInvitation } from "@/service/projectService";

/**
 * Processes any pending invitation token stored in localStorage
 * This should be called after successful user authentication
 */
export const processPendingInvitation = async (): Promise<boolean> => {
  const token = localStorage.getItem('pendingInvitationToken');
  
  if (!token) {
    return false; // No pending invitation
  }

  try {
    await acceptProjectInvitation(token);
    localStorage.removeItem('pendingInvitationToken');
    return true;
  } catch (error) {
    console.error('Error processing invitation:', error);
    localStorage.removeItem('pendingInvitationToken');
    return false;
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