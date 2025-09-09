import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useEffect, useState } from "react";
import issueService from "@/service/issueService";
import projectService from "@/service/projectService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NotificationList } from "@/components/ui/notification-list";
import { useNavigate } from "react-router-dom";

// Interface chuẩn hóa cho dữ liệu từ API
interface Project {
  id: string;
  name: string;
  progress: number;
  totalIssues: number;
  completedIssues: number;
}

interface Issue {
  id: string;
  title: string;
  status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "P0" | "P1" | "P2" | "P3" | "P4" | "P5";
  dueDate: string;
  project: {
    id: string;
    name: string;
  };
  projectId: string; // Added for consistency with API response
}

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedIssues, setDisplayedIssues] = useState<Issue[]>([]);
  const [showAllIssues, setShowAllIssues] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const [issueRes, projectRes] = await Promise.all([
          issueService.getIssuesByAssigneeId(user.id),
          projectService.getProjects(),
        ]);
        const projectsArr = projectRes.result || [];
        const issuesArr = (issueRes.result || []).map((issue: Partial<Issue>) => ({
          ...issue,
          status: issue.status === "TO_DO" ? "TO_DO" : issue.status,
          projectId: issue.projectId || (issue as Partial<Issue>).project?.id,
          project: (issue as Partial<Issue>).project || projectsArr.find((p: Project) => p.id === (issue.projectId || (issue as Partial<Issue>).project?.id)),
        }) as Issue);
        setIssues(issuesArr);
        setDisplayedIssues(issuesArr.slice(0, 10));
        setProjects(projectsArr);
      } catch {
        setError("Lỗi khi tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const statusColors: Record<Issue["status"], string> = {
    TO_DO: "#6B7280",
    IN_PROGRESS: "#3B82F6",
    IN_REVIEW: "#F59E42",
    DONE: "#22C55E"
  };
  const statusLabels: Record<Issue["status"], string> = {
    TO_DO: "Cần làm",
    IN_PROGRESS: "Đang làm",
    IN_REVIEW: "Đang review",
    DONE: "Hoàn thành"
  };
  const statusKeys: Issue["status"][] = ["TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
  const statusData = statusKeys.map(status => ({
    name: statusLabels[status],
    value: issues.filter(i => i.status === status).length,
    color: statusColors[status]
  }));
  const priorityColors: Record<string, string> = {
    P0: "#B91C1C",
    P1: "#EF4444",
    P2: "#F59E42",
    P3: "#FACC15",
    P4: "#4ADE80",
    P5: "#BBF7D0"
  };
  const priorityData = ["P0", "P1", "P2", "P3", "P4", "P5"].map(priority => ({
    name: priority,
    value: issues.filter(i => i.priority === priority).length,
    color: priorityColors[priority]
  }));

  const getStatusBadge = (status: Issue["status"]) => {
    switch (status) {
      case "DONE":
        return <Badge className="bg-green-500 text-white">Hoàn thành</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500 text-white">Đang làm</Badge>;
      case "IN_REVIEW":
        return <Badge className="bg-orange-400 text-white">Đang review</Badge>;
      case "TO_DO":
      default:
        return <Badge className="bg-gray-400 text-white">Cần làm</Badge>;
    }
  };

  const getPriorityBadge = (priority: Issue["priority"]) => {
    switch (priority) {
      case "P0":
        return <Badge className="bg-red-700 text-white">P0</Badge>;
      case "P1":
        return <Badge className="bg-red-500 text-white">P1</Badge>;
      case "P2":
        return <Badge className="bg-orange-500 text-white">P2</Badge>;
      case "P3":
        return <Badge className="bg-yellow-400 text-black">P3</Badge>;
      case "P4":
        return <Badge className="bg-green-400 text-black">P4</Badge>;
      case "P5":
        return <Badge className="bg-green-200 text-black">P5</Badge>;
      default:
        return <Badge className="bg-gray-200 text-black">{priority}</Badge>;
    }
  };

  if (!user) {
    return <div className="text-center py-10">Vui lòng đăng nhập để xem dashboard.</div>;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Xin chào, {user.name}!</h1>
            </div>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Issue của tôi</CardTitle>
          <CardDescription>Các issue được giao</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2 text-left">Tiêu đề</th>
                  <th className="py-2 px-2 text-left">Dự án</th>
                  <th className="py-2 px-2 text-left">Trạng thái</th>
                  <th className="py-2 px-2 text-left">Ưu tiên</th>
                  <th className="py-2 px-2 text-left">Hạn</th>
                </tr>
              </thead>
              <tbody>
                {displayedIssues.map(issue => (
                  <tr key={issue.id} className="border-b hover:bg-muted/50" onClick={() => navigate(`/issues/${issue.id}`)}>
                    <td className="py-2 px-2 font-medium">{issue.title}</td>
                    <td className="py-2 px-2">{projects.find(p => p.id === (issue.projectId || issue.project?.id))?.name || ""}</td>
                    <td className="py-2 px-2">{getStatusBadge(issue.status)}</td>
                    <td className="py-2 px-2">{getPriorityBadge(issue.priority)}</td>
                    <td className="py-2 px-2">{issue.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {issues.length > 10 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (showAllIssues) {
                      setDisplayedIssues(issues.slice(0, 10));
                      setShowAllIssues(false);
                    } else {
                      setDisplayedIssues(issues);
                      setShowAllIssues(true);
                    }
                  }}
                >
                  {showAllIssues ? "Thu gọn" : `Xem thêm ${issues.length - 10} issue`}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái Issue của tôi</CardTitle>
            <CardDescription>Phân bố trạng thái các issue bạn được giao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="90%" height="90%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, idx) => (
                      <Cell key={`cell-status-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mức độ ưu tiên Issue</CardTitle>
            <CardDescription>Phân loại issue theo mức độ ưu tiên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {priorityData.map((entry, idx) => (
                      <Cell key={`cell-priority-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <NotificationList maxItems={5} showActions={true} />
    </div>
  );
}
