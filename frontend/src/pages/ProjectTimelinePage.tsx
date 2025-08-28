import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import sprintService from "@/service/sprintService";
import issueService from "@/service/issueService";
import type { Sprint } from "@/types/sprint";
import type { Issue } from "@/types/issue";
import { toastError } from "@/utils/toast";
import { GitBranch } from "lucide-react";

type IssuesLaneProps = {
  issues: Issue[];
  toPx: (d: string) => number;
  dayWidth: number;
};

// Simple greedy lane packing to avoid overlaps: O(n * lanes)
const IssuesLane: React.FC<IssuesLaneProps> = ({ issues, toPx, dayWidth }) => {
  const navigate = useNavigate();
  type Box = { left: number; right: number; width: number; issue: Issue };
  const boxes: Box[] = issues.map((i) => {
    const left = i.startDate ? toPx(i.startDate) : toPx(i.dueDate || i.createdAt);
    const right = i.dueDate ? toPx(i.dueDate) : left + dayWidth;
    const width = Math.max(dayWidth / 2, right - left || dayWidth / 2);
    return { left, right: left + width, width, issue: i };
  }).sort((a, b) => a.left - b.left);

  const lanes: Box[][] = [];
  boxes.forEach((b) => {
    let placed = false;
    for (const lane of lanes) {
      const last = lane[lane.length - 1];
      if (!last || last.right + 8 <= b.left) { // increased gap for better visibility
        lane.push(b);
        placed = true;
        break;
      }
    }
    if (!placed) lanes.push([b]);
  });

  const laneHeight = 40; // increased height for better readability
  return (
    <div className="relative" style={{ height: lanes.length * laneHeight + 16 }}>
      {lanes.map((lane, li) => (
        <React.Fragment key={li}>
          {lane.map((b) => {
            const i = b.issue;
            const hasRange = !!i.startDate && !!i.dueDate;
            const isOverdue = i.dueDate && new Date(i.dueDate) < new Date();
            const isToday = i.dueDate && new Date(i.dueDate).toDateString() === new Date().toDateString();

            return (
              <div
                key={i.id}
                className="absolute h-8 rounded flex items-center px-3 text-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{ left: b.left, top: li * laneHeight, width: b.width }}
                title={`${i.key} • ${i.title}`}
                onClick={() => navigate(`/issues/${i.id}`)}
              >
                <div className={`h-full w-full rounded transition-colors ${
                  hasRange 
                    ? isOverdue 
                      ? 'bg-red-100 border border-red-400' 
                      : isToday 
                        ? 'bg-orange-100 border border-orange-400'
                        : 'bg-amber-100 border border-amber-300'
                    : isOverdue 
                      ? 'bg-red-50 border border-red-300'
                      : isToday 
                        ? 'bg-orange-50 border border-orange-300'
                        : 'bg-emerald-100 border border-emerald-300'
                }`} />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="truncate font-medium text-sm">{i.key}</span>
                  {i.dueDate && (
                    <Badge 
                      variant={isOverdue ? "destructive" : isToday ? "secondary" : "outline"} 
                      className="ml-2 text-xs"
                    >
                      {new Date(i.dueDate).toLocaleDateString('vi-VN')}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

const ProjectTimelinePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const [sp, is] = await Promise.all([
          sprintService.getSprintsByProject(projectId),
          issueService.getIssuesByProjectId(projectId),
        ]);
        setSprints(sp.result || []);
        setIssues((is.result || []).slice(0, 200));
      } catch (e) {
        console.error(e);
        toastError("Không thể tải dữ liệu timeline");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // Tính dải thời gian hiển thị với scale lớn hơn
  const { minDate, dayWidth, totalDays, toPx } = useMemo(() => {
    const dates: number[] = [];
    sprints.forEach(s => {
      if (s.startDate) dates.push(new Date(s.startDate).getTime());
      if (s.endDate) dates.push(new Date(s.endDate).getTime());
    });
    issues.forEach(i => {
      if (i.startDate) dates.push(new Date(i.startDate).getTime());
      if (i.dueDate) dates.push(new Date(i.dueDate).getTime());
      dates.push(new Date(i.createdAt).getTime());
    });
    const fallback = Date.now();
    const min = dates.length ? Math.min(...dates) : fallback - 30 * 86400000; // increased range
    const max = dates.length ? Math.max(...dates) : fallback + 30 * 86400000; // increased range
    const start = new Date(new Date(min).toDateString()).getTime();
    const end = new Date(new Date(max).toDateString()).getTime();
    const days = Math.max(1, Math.ceil((end - start) / 86400000) + 1);
    const scale = 32; // increased px per day for better visibility
    const toPxFn = (d: string) => (new Date(new Date(d).toDateString()).getTime() - start) / 86400000 * scale;
    return { minDate: start, dayWidth: scale, totalDays: days, toPx: toPxFn };
  }, [sprints, issues]);

  const headerTicks = useMemo(() => {
    const ticks: { left: number; label: string }[] = [];
    const dayMs = 86400000;
    for (let i = 0; i < totalDays; i += 7) {
      const ts = minDate + i * dayMs;
      const label = new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      ticks.push({ left: i * dayWidth, label });
    }
    return ticks;
  }, [minDate, totalDays, dayWidth]);

  if (!projectId) return null;

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        title="Timeline dự án"
        showBackButton
      />
      <ProjectNavigation projectId={projectId} activeTab="timeline" />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Timeline dự án</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timeline Container with Scroll */}
              <div className="overflow-x-auto overflow-y-auto border rounded-lg bg-white" style={{ minHeight: '600px', maxHeight: '800px' }}>
                <div className="min-w-full" style={{ width: Math.max(1200, totalDays * dayWidth) }}>
                  {/* Header scale */}
                  <div className="sticky top-0 z-10 bg-background border-b" style={{ height: '60px' }}>
                    <div className="relative h-full">
                      {headerTicks.map((t, i) => (
                        <div 
                          key={i} 
                          className="absolute top-0 h-full border-l border-dashed text-sm text-muted-foreground bg-background" 
                          style={{ left: t.left, minWidth: '80px' }}
                        >
                          <div className="px-2 py-2 font-medium">{t.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Timeline Content */}
                  <div className="relative p-4">
                    {/* Sprints row */}
                    <div className="h-20 relative mb-6">
                      <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Sprints
                      </div>
                      {sprints.map((s) => {
                        const left = s.startDate ? toPx(s.startDate) : 0;
                        const right = s.endDate ? toPx(s.endDate) : left + dayWidth * 5;
                        const width = Math.max(dayWidth, right - left);
                        return (
                          <div 
                            key={s.id} 
                            className="absolute top-6 h-12 rounded-lg bg-blue-100 border-2 border-blue-300 flex items-center px-4 text-sm font-medium shadow-sm hover:shadow-md transition-shadow" 
                            style={{ left, width, minWidth: '120px' }} 
                            title={`${s.name} (${s.startDate || 'N/A'} → ${s.endDate || 'N/A'})`}
                          >
                            <GitBranch className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="truncate">{s.name}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    {/* Issues row with anti-overlap lane packing */}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        Issues
                      </div>
                      <IssuesLane
                        issues={issues}
                        toPx={toPx}
                        dayWidth={dayWidth}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-6 mb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Sprints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Issues không hạn hoàn thành</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Issues quá hạn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Issues hôm nay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Issues chưa đến hạn</span>
                  </div>
                </div>
               
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimelinePage;

