import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <p className="text-2xl md:text-3xl font-medium mb-4">Page Not Found</p>
      <p className="text-lg text-muted-foreground mb-8 text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
