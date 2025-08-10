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
import { Progress } from "@/components/ui/progress";

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
      : undefined,
    assignee: i.assigneeId
      ? {
          id: i.assigneeId as string,
          name: i.assigneeName as string,
          email: i.assigneeEmail as string,
        }
      : undefined,
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

const getPriorityBarData = (priorityStats) =>
  Object.keys(priorityStats).map((key) => ({ name: key, value: priorityStats[key] }));

function calculateBurndownData(sprint, issues) {
  if (!sprint?.startDate || !sprint?.endDate) return [];
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const totalDays = differenceInCalendarDays(end, start) + 1;
  if (totalDays <= 0) return [];
  const totalIssues = issues.length;
  const doneDates = issues
    .filter(i => i.status === 'DONE')
    .map(i => new Date(i.updatedAt));
  const days = Array.from({ length: totalDays }, (_, i) => addDays(start, i));
  const idealStep = totalIssues / (totalDays - 1 || 1);
  const actualArr = days.map(day => {
    const doneCount = doneDates.filter(d => d <= day).length;
    return totalIssues - doneCount;
  });
  const idealArr = days.map((_, i) => Math.max(totalIssues - Math.round(i * idealStep), 0));
  return days.map((day, i) => ({
    day: format(day, 'dd/MM/yyyy'),
    ideal: idealArr[i],
    actual: actualArr[i],
  }));
}

function calculateVelocity(sprint, issues) {
  if (!sprint || !issues.length) return 0;
  // Tính tổng story points của các issue đã hoàn thành (DONE)
  return issues
    .filter(issue => issue.status === 'DONE' && issue.storyPoints)
    .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
}

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
  }).filter(item => item.velocity > 0);
}

function calculateCompletionPercentage(issues: Issue[]): number {
  if (issues.length === 0) return 0;
  
  let totalWeight = 0;
  let completedWeight = 0;
  
  issues.forEach(issue => {
    const issueWeight = issue.storyPoints || 1;
    totalWeight += issueWeight;
    
    // Nếu issue đã hoàn thành
    if (issue.status === 'DONE') {
      completedWeight += issueWeight;
    }
    
    // Tính weight cho subtasks nếu có
    if (issue.subtasks && issue.subtasks.length > 0) {
      let subtaskTotalWeight = 0;
      let subtaskCompletedWeight = 0;
      
      issue.subtasks.forEach(subtask => {
        const subtaskWeight = subtask.storyPoints || 1;
        subtaskTotalWeight += subtaskWeight;
        
        if (subtask.status === 'DONE') {
          subtaskCompletedWeight += subtaskWeight;
        }
      });
      
      if (subtaskTotalWeight > 0) {
        const subtaskCompletion = subtaskCompletedWeight / subtaskTotalWeight;
        completedWeight += issueWeight * subtaskCompletion;
      }
    }
  });
  
  return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
}

// Component biểu đồ tỷ lệ hoàn thành
const CompletionProgressChart: React.FC<{ issues: Issue[] }> = ({ issues }) => {
  const completionPercentage = calculateCompletionPercentage(issues);
  const completedIssues = issues.filter(i => i.status === 'DONE').length;
  const totalIssues = issues.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tỷ lệ hoàn thành</span>
          <span className="text-2xl font-bold text-green-600">
            {Math.round(completionPercentage)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tiến độ dự án</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hoàn thành: {completedIssues} / {totalIssues} issues</span>
            <span>Story Points: {issues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0)}</span>
          </div>
        </div>
        
        {/* Chi tiết theo status */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {issues.filter(i => i.status === 'DONE').length}
            </div>
            <div className="text-xs text-muted-foreground">Đã hoàn thành</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {issues.filter(i => i.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-xs text-muted-foreground">Đang làm</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {issues.filter(i => i.status === 'IN_REVIEW').length}
            </div>
            <div className="text-xs text-muted-foreground">Đang review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {issues.filter(i => i.status === 'TO_DO').length}
            </div>
            <div className="text-xs text-muted-foreground">Cần làm</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};



// Component biểu đồ tỷ lệ hoàn thành theo loại issue
const CompletionByIssueTypeChart: React.FC<{ issues: Issue[] }> = ({ issues }) => {
  const issueTypes = ['STORY', 'TASK', 'BUG', 'SUBTASK'];
  
  const createIssueTypeData = () => {
    return issueTypes.map(type => {
      const typeIssues = issues.filter(issue => issue.issueType === type);
      const completionPercentage = calculateCompletionPercentage(typeIssues);
      
      return {
        type: type,
        completion: Math.round(completionPercentage),
        total: typeIssues.length,
        completed: typeIssues.filter(i => i.status === 'DONE').length,
        color: type === 'STORY' ? '#3b82f6' : 
               type === 'TASK' ? '#22c55e' : 
               type === 'BUG' ? '#ef4444' : '#f59e0b'
      };
    }).filter(item => item.total > 0); // Chỉ hiển thị loại có issues
  };

  const issueTypeData = createIssueTypeData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tỷ lệ hoàn thành theo loại issue</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={issueTypeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value, name) => [
                `${value}%`, 
                name === 'completion' ? 'Tỷ lệ hoàn thành' : name
              ]}
              labelFormatter={label => `Loại: ${label}`}
            />
            <Legend />
            <Bar dataKey="completion" name="Tỷ lệ hoàn thành">
              {issueTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {issueTypeData.map(item => (
            <div key={item.type} className="text-center">
              <div className="text-lg font-bold" style={{ color: item.color }}>
                {item.completion}%
              </div>
              <div className="text-xs text-muted-foreground">
                {item.type} ({item.completed}/{item.total})
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component biểu đồ phân bổ công việc
const WorkDistributionChart: React.FC<{ issues: Issue[] }> = ({ issues }) => {
  // Phân bổ theo priority
  const getPriorityDistribution = () => {
    const priorityMap = new Map();
    
    issues.forEach(issue => {
      const priority = issue.priority;
      
      if (!priorityMap.has(priority)) {
        priorityMap.set(priority, {
          priority,
          total: 0,
          storyPoints: 0,
          completed: 0
        });
      }
      
      const data = priorityMap.get(priority);
      data.total++;
      data.storyPoints += issue.storyPoints || 0;
      if (issue.status === 'DONE') data.completed++;
    });
    
    return Array.from(priorityMap.values())
      .sort((a, b) => a.priority.localeCompare(b.priority));
  };

  // Phân bổ theo issue type
  const getIssueTypeDistribution = () => {
    const typeMap = new Map();
    
    issues.forEach(issue => {
      const type = issue.issueType;
      
      if (!typeMap.has(type)) {
        typeMap.set(type, {
          type,
          total: 0,
          storyPoints: 0,
          completed: 0
        });
      }
      
      const data = typeMap.get(type);
      data.total++;
      data.storyPoints += issue.storyPoints || 0;
      if (issue.status === 'DONE') data.completed++;
    });
    
    return Array.from(typeMap.values())
      .sort((a, b) => b.total - a.total);
  };

  const priorityData = getPriorityDistribution();
  const issueTypeData = getIssueTypeDistribution();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bổ công việc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phân bổ theo priority */}
        <div>
          <h4 className="text-sm font-medium mb-3">Theo độ ưu tiên</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'total' ? 'Tổng số' :
                  name === 'completed' ? 'Hoàn thành' :
                  name === 'storyPoints' ? 'Story Points' : name
                ]}
              />
              <Legend />
              <Bar dataKey="total" name="Tổng số" fill="#3b82f6" />
              <Bar dataKey="completed" name="Hoàn thành" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Phân bổ theo issue type */}
        <div>
          <h4 className="text-sm font-medium mb-3">Theo loại issue</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={issueTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'total' ? 'Tổng số' :
                  name === 'completed' ? 'Hoàn thành' :
                  name === 'storyPoints' ? 'Story Points' : name
                ]}
              />
              <Legend />
              <Bar dataKey="total" name="Tổng số" fill="#8b5cf6" />
              <Bar dataKey="completed" name="Hoàn thành" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {issues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Tổng Story Points</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {issueTypeData.length}
            </div>
            <div className="text-xs text-muted-foreground">Loại issue</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {priorityData.length}
            </div>
            <div className="text-xs text-muted-foreground">Mức ưu tiên</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
      const mappedIssues = response.result.map(mapIssue);
      
      // Temporarily skip subtasks to debug
      setIssues(mappedIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toastError("Không thể tải danh sách issues!");
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuesBySprint = async (sprintId: string) => {
    try {
      const response = await sprintService.getIssuesBySprint(sprintId);
      const mappedIssues = response.result.map(mapIssue);
      
      // Temporarily skip subtasks to debug
      setIssues(mappedIssues);
    } catch (error) {
      console.error('Error fetching sprint issues:', error);
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
        <WorkDistributionChart issues={issues} />
        <CompletionProgressChart issues={issues} />
      </div>


      {/* Completion by Issue Type Chart */}
      <CompletionByIssueTypeChart issues={issues} />

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