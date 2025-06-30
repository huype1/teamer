/**
 * Invitation utility functions for handling pending invitations
 * after user authentication (login/signup)
 */

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
    // Call your backend API to accept the invitation
    const response = await fetch('/api/invitations/accept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // User's auth token
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      // Successfully processed invitation
      localStorage.removeItem('pendingInvitationToken');
      return true;
    } else {
      // Handle error - token might be invalid or expired
      console.error('Failed to process invitation:', response.statusText);
      localStorage.removeItem('pendingInvitationToken');
      return false;
    }
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