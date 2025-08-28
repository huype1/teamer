import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Paperclip, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toastError } from "@/utils/toast";
import searchService, { type SearchResult } from "@/service/searchService";

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
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
       const results = await searchService.searchAll(searchKeyword);
       setResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toastError("Có lỗi xảy ra khi tìm kiếm!");
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
    const searchKeyword = searchParams.get('q');
    if (searchKeyword) {
      setKeyword(searchKeyword);
      handleSearch(searchKeyword);
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'issue':
        return <AlertCircle className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'attachment':
        return <Paperclip className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'issue':
        return 'Công việc';
      case 'document':
        return 'Tài liệu';
      case 'attachment':
        return 'Tệp đính kèm';
      default:
        return 'Khác';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'issue':
        return 'bg-blue-100 text-blue-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      case 'attachment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tìm kiếm</h1>
        <p className="text-muted-foreground">
          Tìm kiếm trong công việc, tài liệu và tệp đính kèm
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <LoadingSpinner className="h-4 w-4 mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Tìm kiếm
          </Button>
        </div>
      </form>

      {hasSearched && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
              <p>Đang tìm kiếm...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Kết quả tìm kiếm ({results.length})
                </h2>
                <p className="text-sm text-muted-foreground">
                  Từ khóa: "{keyword}"
                </p>
              </div>
              
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(result.type)}
                            <Link 
                              to={result.url}
                              className="font-medium text-lg hover:text-primary transition-colors"
                            >
                              {result.title}
                            </Link>
                            <Badge className={getTypeColor(result.type)}>
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          
                          {result.description && (
                            <p className="text-muted-foreground mb-2 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Dự án: {result.projectName}</span>
                            <span>
                              {new Date(result.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy kết quả</h3>
              <p className="text-muted-foreground">
                Không có kết quả nào cho từ khóa "{keyword}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
