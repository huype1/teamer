import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProjectService from "@/service/projectService";
import issueService from "@/service/issueService";
import type { Project } from "@/types/project";
import type { Issue } from "@/types/issue";
import { toastError } from "@/utils/toast";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import sprintService from '@/service/sprintService';
import type { Sprint } from '@/types/sprint';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const mapIssue = (issue: unknown): Issue => {
  const i = issue as Record<string, unknown>;
  return {
    ...i,
    issueType: (i.issueType as string) || "TASK",
    sprintId: i.sprintId ? String(i.sprintId) : undefined,
    reporter: i.reporterId
      ? {
          id: i.reporterId as string,
          name: i.reporterName as string,
          email: i.reporterEmail as string,
        }
      : null,
    assignee: i.assigneeId
      ? {
          id: i.assigneeId as string,
          name: i.assigneeName as string,
          email: i.assigneeEmail as string,
        }
      : null,
  } as Issue;
};

const STATUS_COLORS = ['#3B82F6', '#F59E42', '#A78BFA', '#22C55E'];
const PRIORITY_COLORS = ['#EF4444', '#F59E42', '#FDE047', '#22C55E', '#3B82F6', '#6B7280'];

// Chuẩn bị data cho PieChart (status)
const getStatusPieData = (statusStats) => [
  { name: 'Cần làm', value: statusStats.TO_DO },
  { name: 'Đang làm', value: statusStats.IN_PROGRESS },
  { name: 'Review', value: statusStats.IN_REVIEW },
  { name: 'Hoàn thành', value: statusStats.DONE },
];

// Chuẩn bị data cho BarChart (priority)
const getPriorityBarData = (priorityStats) =>
  Object.keys(priorityStats).map((key) => ({ name: key, value: priorityStats[key] }));

// Hàm tính dữ liệu burndown thực tế từ issues và sprint
function calculateBurndownData(sprint, issues) {
  if (!sprint?.startDate || !sprint?.endDate) return [];
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const totalDays = differenceInCalendarDays(end, start) + 1;
  if (totalDays <= 0) return [];
  const totalIssues = issues.length;
  // Lấy ngày hoàn thành của từng issue (status DONE)
  const doneDates = issues
    .filter(i => i.status === 'DONE')
    .map(i => new Date(i.updatedAt));
  // Tạo mảng ngày
  const days = Array.from({ length: totalDays }, (_, i) => addDays(start, i));
  // Lý tưởng: giảm đều mỗi ngày
  const idealStep = totalIssues / (totalDays - 1 || 1);
  // Tính số lượng còn lại thực tế mỗi ngày
  const actualArr = days.map(day => {
    // Đếm số issue hoàn thành đến hết ngày này
    const doneCount = doneDates.filter(d => d <= day).length;
    return totalIssues - doneCount;
  });
  // Lý tưởng: giảm đều
  const idealArr = days.map((_, i) => Math.max(totalIssues - Math.round(i * idealStep), 0));
  // Kết quả
  return days.map((day, i) => ({
    day: format(day, 'dd/MM/yyyy'),
    ideal: idealArr[i],
    actual: actualArr[i],
  }));
}

// Hàm tính velocity (story points hoàn thành) cho sprint
function calculateVelocity(sprint, issues) {
  if (!sprint || !issues.length) return 0;
  // Tính tổng story points của các issue đã hoàn thành (DONE)
  return issues
    .filter(issue => issue.status === 'DONE' && issue.storyPoints)
    .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
}

// Hàm tính velocity cho tất cả sprint
function calculateAllVelocities(sprints, allIssues) {
  return sprints.map(sprint => {
    const sprintIssues = allIssues.filter(issue => issue.sprintId === sprint.id);
    const velocity = calculateVelocity(sprint, sprintIssues);
    return {
      name: sprint.name,
      velocity: velocity,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate
    };
  }).filter(item => item.velocity > 0); // Chỉ hiển thị sprint có velocity > 0
}

const ProjectReportsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]); // dùng cho chart
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchSprints();
      fetchIssues();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedSprintId) {
      const sprint = sprints.find(s => s.id === selectedSprintId) || null;
      setSelectedSprint(sprint);
      fetchIssuesBySprint(selectedSprintId);
    } else if (projectId) {
      setSelectedSprint(null);
      fetchIssues();
    }
  }, [selectedSprintId, sprints]);

  const fetchProject = async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
    } catch {
      toastError("Không thể tải thông tin dự án!");
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await sprintService.getSprintsByProject(projectId!);
      setSprints(response.result || []);
    } catch {
      toastError("Không thể tải danh sách sprint!");
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await issueService.getIssuesByProjectId(projectId!);
      console.log(response);
      setIssues(response.result.map(mapIssue));
    } catch {
      toastError("Không thể tải danh sách issues!");
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuesBySprint = async (sprintId: string) => {
    try {
      const response = await sprintService.getIssuesBySprint(sprintId);
      setIssues(response.result.map(mapIssue));
    } catch {
      toastError("Không thể tải issues của sprint!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      TO_DO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };
    
    issues.forEach(issue => {
      if (Object.prototype.hasOwnProperty.call(stats, issue.status)) {
        stats[issue.status as keyof typeof stats]++;
      }
    });
    
    return stats;
  };

  const getPriorityStats = () => {
    const stats = {
      P0: 0,
      P1: 0,
      P2: 0,
      P3: 0,
      P4: 0,
      P5: 0,
    };
    
    issues.forEach(issue => {
      if (Object.prototype.hasOwnProperty.call(stats, issue.priority)) {
        stats[issue.priority as keyof typeof stats]++;
      }
    });
    
    return stats;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Button asChild className="mt-4">
            <Link to="/projects">Quay lại danh sách dự án</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusStats = getStatusStats(); // dùng cho chart
  const priorityStats = getPriorityStats(); // dùng cho chart
  // sử dụng issues trong các hàm chart bên dưới để tránh linter warning
  // (ví dụ: getBurndownData(issues), getPriorityBarData(getPriorityStats(issues)), ...)

  // Chart data
  const statusPieData = getStatusPieData(statusStats);
  const priorityBarData = getPriorityBarData(priorityStats);
  const burndownData = selectedSprint ? calculateBurndownData(selectedSprint, issues) : [];
  const velocityData = calculateAllVelocities(sprints, issues);

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        title={`${project?.name || ""} - Báo cáo`}
        showBackButton
      />
      <ProjectNavigation projectId={projectId!} />

      {/* Sprint Select */}
      <div className="mb-4 flex items-center gap-4">
        <span className="font-medium">Chọn sprint:</span>
        <Select value={selectedSprintId ?? 'all'} onValueChange={v => setSelectedSprintId(v === 'all' ? null : v)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tất cả issues trong project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả issues trong project</SelectItem>
            {sprints.map(sprint => (
              <SelectItem key={sprint.id} value={sprint.id}>
                {sprint.name} ({sprint.status})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tổng số issues & Tỷ lệ hoàn thành */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tổng số issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32">
              <span className="text-5xl font-bold text-primary">{issues.length}</span>
              <span className="text-muted-foreground mt-2">Tổng số issues trong {selectedSprintId ? 'sprint' : 'dự án'}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32">
              <span className="text-5xl font-bold text-green-600">
                {issues.length > 0 ? `${Math.round((statusStats.DONE / issues.length) * 100)}%` : '0%'}
              </span>
              <span className="text-muted-foreground mt-2">Số lượng hoàn thành: {statusStats.DONE} / {issues.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Burndown Chart */}
      {selectedSprint ? (
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ Burndown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value, name) => [value, name === 'ideal' ? 'Lý tưởng' : 'Thực tế']} labelFormatter={label => `Ngày: ${label}`} />
                <Legend />
                <Line type="monotone" dataKey="ideal" stroke="#8884d8" strokeWidth={2} dot={false} name="Lý tưởng" />
                <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Thực tế" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ Burndown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 text-muted-foreground">Chọn sprint để xem biểu đồ burndown</div>
          </CardContent>
        </Card>
      )}

      {/* Velocity Chart */}
      {velocityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Velocity Chart (Story Points hoàn thành)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [value, 'Story Points']}
                  labelFormatter={label => `Sprint: ${label}`}
                />
                <Legend />
                <Bar dataKey="velocity" name="Story Points hoàn thành" fill="#10B981">
                  {velocityData.map((entry, index) => (
                    <Cell key={`cell-velocity-${index}`} fill="#10B981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bar & Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo độ ưu tiên</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số lượng" fill="#3B82F6">
                  {priorityBarData.map((entry, index) => (
                    <Cell key={`cell-priority-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ trạng thái (Pie Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default ProjectReportsPage; 