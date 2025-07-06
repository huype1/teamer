import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  Users, 
  Zap,
  BookOpen,
  Target,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  CalendarDays,
  User,
  ListTodo
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

interface RecentDocument {
  id: string;
  title: string;
  type: "page" | "blog" | "space";
  lastModified: string;
  author: {
    name: string;
    avatar: string;
  };
  views: number;
}

interface SprintProgress {
  id: string;
  name: string;
  progress: number;
  totalIssues: number;
  completedIssues: number;
  remainingDays: number;
}

interface TeamActivity {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

interface Issue {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  priority: "P0" | "P1" | "P2" | "P3" | "P4" | "P5";
  assignee: string;
  dueDate: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const quickActions: QuickAction[] = [
    {
      id: "1",
      title: "Tạo Issue",
      description: "Báo lỗi hoặc yêu cầu tính năng mới",
      icon: <Plus className="h-5 w-5" />,
      color: "bg-blue-500",
      href: "/projects/new-issue"
    },
    {
      id: "2",
      title: "Tạo Tài liệu",
      description: "Tạo trang hoặc bài viết blog",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-green-500",
      href: "/docs/new"
    },
    {
      id: "3",
      title: "Bắt đầu Sprint",
      description: "Bắt đầu một sprint phát triển mới",
      icon: <Zap className="h-5 w-5" />,
      color: "bg-purple-500",
      href: "/sprints/new"
    },
  ];

  const recentDocuments: RecentDocument[] = [
    {
      id: "1",
      title: "Tài liệu API v2.1",
      type: "page",
      lastModified: "2 giờ trước",
      author: { name: "Sarah Chen", avatar: "" },
      views: 156
    },
    {
      id: "2",
      title: "Lộ trình sản phẩm Q4",
      type: "blog",
      lastModified: "1 ngày trước",
      author: { name: "Mike Johnson", avatar: "" },
      views: 89
    },
    {
      id: "3",
      title: "Hướng dẫn hệ thống thiết kế",
      type: "page",
      lastModified: "3 ngày trước",
      author: { name: "Emma Wilson", avatar: "" },
      views: 234
    }
  ];

  const activeSprints: SprintProgress[] = [
    {
      id: "1",
      name: "Sprint 23 - User Dashboard",
      progress: 75,
      totalIssues: 12,
      completedIssues: 9,
      remainingDays: 3
    },
    {
      id: "2",
      name: "Sprint 22 - API Integration",
      progress: 45,
      totalIssues: 8,
      completedIssues: 4,
      remainingDays: 7
    }
  ];

  const teamActivity: TeamActivity[] = [
    {
      id: "1",
      user: { name: "Alex Kim", avatar: "" },
      action: "completed issue",
      target: "Fix login validation",
      timestamp: "5 minutes ago"
    },
    {
      id: "2",
      user: { name: "Lisa Park", avatar: "" },
      action: "commented on",
      target: "User Dashboard Design",
      timestamp: "15 minutes ago"
    },
    {
      id: "3",
      user: { name: "David Lee", avatar: "" },
      action: "started working on",
      target: "API Rate Limiting",
      timestamp: "1 hour ago"
    }
  ];

  const upcomingIssues: Issue[] = [
    {
      id: "1",
      title: "Fix login validation",
      status: "in-progress",
      priority: "P0",
      assignee: "Alex Kim",
      dueDate: "2024-01-15"
    },
    {
      id: "2",
      title: "Update API documentation",
      status: "todo",
      priority: "P2",
      assignee: "Sarah Chen",
      dueDate: "2024-01-18"
    },
    {
      id: "3",
      title: "Implement dark mode",
      status: "todo",
      priority: "P5",
      assignee: "Emma Wilson",
      dueDate: "2024-01-25"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-700 text-white";
      case "P1":
        return "bg-red-500 text-white";
      case "P2":
        return "bg-orange-500 text-white";
      case "P3":
        return "bg-yellow-400 text-black";
      case "P4":
        return "bg-green-400 text-black";
      case "P5":
        return "bg-green-200 text-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
          <p className="text-muted-foreground">
            Chào mừng trở lại! Đây là những gì đang diễn ra với các dự án của bạn hôm nay.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Hôm nay
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhanh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Card key={action.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dự án của tôi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số Issue</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issue được giao cho tôi</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>

          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="projects">Dự án</TabsTrigger>
          <TabsTrigger value="docs">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Trạng thái Issue
                </CardTitle>
                <CardDescription>Phân bố hiện tại của các issue theo trạng thái</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">Chưa làm</span>
                    </div>
                    <span className="text-sm font-medium">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Đang làm</span>
                    </div>
                    <span className="text-sm font-medium">34</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Đang review</span>
                    </div>
                    <span className="text-sm font-medium">34</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Hoàn thành</span>
                    </div>
                    <span className="text-sm font-medium">32</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issue Priority Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Mức độ ưu tiên Issue
                </CardTitle>
                <CardDescription>Phân loại issue theo mức độ ưu tiên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-700 rounded-full"></div>
                      <span className="text-sm">P0 (Cao nhất)</span>
                    </div>
                    <span className="text-sm font-medium">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">P1</span>
                    </div>
                    <span className="text-sm font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">P2</span>
                    </div>
                    <span className="text-sm font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm">P3</span>
                    </div>
                    <span className="text-sm font-medium">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm">P4</span>
                    </div>
                    <span className="text-sm font-medium">22</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                      <span className="text-sm">P5 (Thấp nhất)</span>
                    </div>
                    <span className="text-sm font-medium">24</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Sprints
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Active Sprints
              </CardTitle>
              <CardDescription>Current sprint progress and remaining work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSprints.map((sprint) => (
                  <div key={sprint.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{sprint.name}</h4>
                      <Badge variant="secondary">
                        {sprint.remainingDays} days left
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{sprint.completedIssues}/{sprint.totalIssues} issues completed</span>
                      <span>{sprint.progress}% complete</span>
                    </div>
                    <Progress value={sprint.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Dự án gần đây</CardTitle>
                <CardDescription>Các dự án bạn hoạt động nhiều nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Nền tảng thương mại điện tử", progress: 85, issues: 23, members: 8 },
                    { name: "Ứng dụng di động", progress: 62, issues: 15, members: 5 },
                    { name: "Thiết kế lại website", progress: 45, issues: 31, members: 12 }
                  ].map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FolderOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.issues} issue • {project.members} thành viên
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{project.progress}%</div>
                        <Progress value={project.progress} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê dự án</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Issue đang hoạt động</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hoàn thành hôm nay</span>
                  <span className="font-semibold">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Thành viên nhóm</span>
                  <span className="font-semibold">24</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Documents */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Tài liệu gần đây
                </CardTitle>
                <CardDescription>Tài liệu và trang vừa được cập nhật</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {doc.type === "page" ? "Trang" : doc.type === "blog" ? "Blog" : "Không gian"} • {doc.lastModified} • {doc.views} lượt xem
                          </p>
                        </div>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={doc.author.avatar} />
                        <AvatarFallback>{doc.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documentation Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Tài liệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tổng số trang</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bài viết blog</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Không gian</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tổng lượt xem</span>
                  <span className="font-semibold">2.4k</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Hoạt động gần đây
                </CardTitle>
                <CardDescription>Cập nhật mới nhất từ nhóm của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>{" "}
                          {activity.action === "completed issue"
                            ? "đã hoàn thành"
                            : activity.action === "commented on"
                            ? "đã bình luận về"
                            : activity.action === "started working on"
                            ? "bắt đầu làm"
                            : activity.action}{" "}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Hạn sắp tới
                </CardTitle>
                <CardDescription>Các issue và công việc sắp đến hạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(issue.status)}
                        <div>
                          <h4 className="font-medium text-sm">{issue.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Giao cho {issue.assignee}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3 inline mr-1" />
                          {issue.dueDate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
