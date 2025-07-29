import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  text,
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-transparent border-b-primary",
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="ml-2 text-sm">
          {text}
        </span>
      )}
    </div>
  );
}

// Convenience components for common use cases
export function PageLoadingSpinner({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function FullPageLoadingSpinner({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function SmallLoadingSpinner({ text }: { text?: string }) {
  return <LoadingSpinner size="sm" text={text} />;
}

export function MediumLoadingSpinner({ text }: { text?: string }) {
  return <LoadingSpinner size="md" text={text} />;
}