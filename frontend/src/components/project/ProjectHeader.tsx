import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title = "Projects",
  showBackButton = false,
  showSearch = false,
  searchPlaceholder = "Tìm kiếm...",
  searchValue = "",
  onSearchChange,
  children
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button variant="ghost" size="icon" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {showBackButton ? "Thông tin và quản lý dự án" : "Quản lý dự án và hợp tác với nhóm"}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {showSearch && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default ProjectHeader; 