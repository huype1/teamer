export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'issue' | 'attachment' | 'document';
  projectId: string;
  projectName: string;
  createdAt: string;
  url: string;
}

// Tạm thời sử dụng mock data để demo
// Sau này có thể implement API thật
export const searchAll = async (keyword: string): Promise<SearchResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data - sau này sẽ thay bằng API calls thật
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Issue tìm kiếm',
      description: 'Mô tả issue có chứa từ khóa',
      type: 'issue',
      projectId: 'project1',
      projectName: 'Project A',
      createdAt: new Date().toISOString(),
      url: `/projects/project1/issues/1`
    },
    {
      id: '2',
      title: 'Document tìm kiếm',
      description: 'Nội dung document có chứa từ khóa',
      type: 'document',
      projectId: 'project1',
      projectName: 'Project A',
      createdAt: new Date().toISOString(),
      url: `/documents/2/edit`
    },
    {
      id: '3',
      title: 'attachment.pdf',
      description: 'File attachment có tên chứa từ khóa',
      type: 'attachment',
      projectId: 'project2',
      projectName: 'Project B',
      createdAt: new Date().toISOString(),
      url: `/projects/project2/documents`
    }
  ];
  
  // Filter theo keyword
  const filteredResults = mockResults.filter(result => 
    result.title.toLowerCase().includes(keyword.toLowerCase()) ||
    result.description?.toLowerCase().includes(keyword.toLowerCase()) ||
    result.projectName.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return filteredResults;
};

export default {
  searchAll,
};
