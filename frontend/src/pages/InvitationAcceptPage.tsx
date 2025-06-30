import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * InvitationAcceptPage handles invitation acceptance flow:
 * 1. Extracts token from URL query parameters
 * 2. Saves token to localStorage for later processing
 * 3. Shows appropriate message to user
 * 4. Redirects to login/register when user is ready
 */
const InvitationAcceptPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link. No token found.');
      return;
    }

    try {
      // Save the invitation token to localStorage for later processing
      localStorage.setItem('pendingInvitationToken', token);
      
      setStatus('success');
      setMessage('Invitation accepted! Please sign in or create an account to join the project.');
    } catch (error) {
      console.error('Error saving invitation token:', error);
      setStatus('error');
      setMessage('Failed to process invitation. Please try again.');
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Processing Invitation...';
      case 'success':
        return 'Invitation Accepted!';
      case 'error':
        return 'Invitation Error';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">{getStatusTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your invitation has been saved. You'll be automatically added to the project once you sign in.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationAcceptPage; 