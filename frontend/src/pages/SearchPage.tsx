import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toastError } from "@/utils/toast";
import searchService from "@/service/searchService";
import type { Issue } from "@/types/issue";

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      toastError("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const results = await searchService.searchIssues(searchKeyword);
      setIssues(results);
    } catch (error) {
      console.error("Search error:", error);
      toastError("Có lỗi xảy ra khi tìm kiếm!");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: keyword });
    handleSearch(keyword);
  };

  useEffect(() => {
    const searchKeyword = searchParams.get("q");
    if (searchKeyword) {
      setKeyword(searchKeyword);
      handleSearch(searchKeyword);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1":
        return "bg-red-100 text-red-800";
      case "P2":
        return "bg-orange-100 text-orange-800";
      case "P3":
        return "bg-yellow-100 text-yellow-800";
      case "P4":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tìm kiếm công việc</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm công việc..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="text-lg"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Đang tìm...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </>
              )}
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
            <p>Đang tìm kiếm...</p>
          </div>
        ) : issues.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Kết quả tìm kiếm ({issues.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Tìm thấy {issues.length} công việc cho "{keyword}"
              </p>
            </div>

            <div className="space-y-4">
              {issues.map((issue) => (
                <Card
                  key={issue.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <Link
                            to={`/issues/${issue.id}`}
                            className="font-medium text-lg hover:text-primary transition-colors"
                          >
                            {issue.key} - {issue.title}
                          </Link>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </div>

                        {issue.description && (
                          <p className="text-muted-foreground mb-2 line-clamp-2">
                            {issue.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Dự án: {issue.projectName}</span>
                          {issue.assigneeName && (
                            <span>Người thực hiện: {issue.assigneeName}</span>
                          )}
                          <span>
                            {new Date(issue.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-muted-foreground">
              Không có công việc nào phù hợp với từ khóa
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
