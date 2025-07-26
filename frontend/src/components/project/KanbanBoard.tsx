import React from "react";
import type { Issue } from '@/types/issue';
import type { ProjectMember } from '@/types/project';
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Bug, FileText, Layers, Target, Zap, Plus, AlertCircle, CheckCircle2, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface KanbanBoardProps {
  issues: Issue[];
  projectMembers: ProjectMember[];
  onOpenCreateIssue?: () => void;
  canCreateIssue?: boolean;
  onStatusChange?: (issueId: string, newStatus: string) => void;
  onCreateSubtask?: (issue: Issue) => void;
}

interface ColumnConfig {
  key: string;
  label: string;
  gradient: string;
  borderColor: string;
  iconBg: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

const STATUS_COLUMNS = [
  { 
    key: "TO_DO", 
    label: "🚀 Cần làm",
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    iconBg: "bg-blue-500",
    icon: AlertCircle,
    count: 0
  },
  { 
    key: "IN_PROGRESS", 
    label: "⚡ Đang làm",
    gradient: "from-orange-500/20 to-yellow-500/20",
    borderColor: "border-orange-500/30",
    iconBg: "bg-orange-500",
    icon: Clock,
    count: 0
  },
  { 
    key: "IN_REVIEW", 
    label: "👀 Đang review",
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    iconBg: "bg-purple-500",
    icon: Eye,
    count: 0
  },
  { 
    key: "DONE", 
    label: "✨ Đã hoàn thành",
    gradient: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    iconBg: "bg-green-500",
    icon: CheckCircle2,
    count: 0
  },
];

const getIssueTypeConfig = (issueType: string) => {
  switch (issueType) {
    case "EPIC":
      return {
        icon: Layers,
        gradient: "from-purple-600 to-indigo-600",
        textColor: "text-white",
        label: "Epic",
        emoji: "🎯"
      };
    case "STORY":
      return {
        icon: FileText,
        gradient: "from-blue-600 to-cyan-600",
        textColor: "text-white",
        label: "Story",
        emoji: "📖"
      };
    case "TASK":
      return {
        icon: Target,
        gradient: "from-green-600 to-emerald-600",
        textColor: "text-white",
        label: "Task",
        emoji: "✅"
      };
    case "BUG":
      return {
        icon: Bug,
        gradient: "from-red-600 to-pink-600",
        textColor: "text-white",
        label: "Bug",
        emoji: "🐛"
      };
    case "SUBTASK":
      return {
        icon: Zap,
        gradient: "from-yellow-600 to-orange-600",
        textColor: "text-white",
        label: "Subtask",
        emoji: "⚡"
      };
    default:
      return {
        icon: Target,
        gradient: "from-gray-600 to-slate-600",
        textColor: "text-white",
        label: "Task",
        emoji: "✅"
      };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case "P0":
      return { color: "bg-red-500", text: "text-white", pulse: "animate-pulse" };
    case "P1":
      return { color: "bg-orange-500", text: "text-white", pulse: "" };
    case "P2":
      return { color: "bg-yellow-500", text: "text-black", pulse: "" };
    case "P3":
      return { color: "bg-blue-500", text: "text-white", pulse: "" };
    case "P4":
      return { color: "bg-gray-500", text: "text-white", pulse: "" };
    case "P5":
      return { color: "bg-gray-400", text: "text-white", pulse: "" };
    default:
      return { color: "bg-gray-500", text: "text-white", pulse: "" };
  }
};

function DraggableIssue({ issue, children }: { issue: Issue; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.7 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={`transition-all duration-200 ${isDragging ? 'rotate-2 scale-105 z-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

function DroppableColumn({ status, children, columnConfig }: { status: string; children: React.ReactNode; columnConfig: ColumnConfig }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });
  
  const ColumnIcon = columnConfig.icon;
  
  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[600px] min-w-[280px] w-80 flex-shrink-0 transition-all duration-300 rounded-xl
        bg-gradient-to-br ${columnConfig.gradient} backdrop-blur-sm
        border-2 ${isOver ? 'border-primary scale-105 shadow-2xl' : columnConfig.borderColor}
        ${isOver ? 'shadow-primary/20' : 'shadow-lg'}
        hover:shadow-xl transform hover:-translate-y-1
      `}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`${columnConfig.iconBg} p-2 rounded-lg shadow-lg`}>
            <ColumnIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
              {columnConfig.label}
            </h3>
            <Badge 
              variant="secondary" 
              className="bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 font-semibold"
            >
              {columnConfig.count} issues
            </Badge>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ issues, onOpenCreateIssue, canCreateIssue, onStatusChange, onCreateSubtask }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Update column counts
  const columnsWithCount: ColumnConfig[] = STATUS_COLUMNS.map(col => ({
    ...col,
    count: issues.filter(i => i.status === col.key).length
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    const issueId = active.id;
    const newStatus = over.id;
    const issue = issues.find(i => i.id === issueId);
    if (issue && issue.status !== newStatus && onStatusChange) {
      onStatusChange(issueId as string, newStatus as string);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 rounded-2xl p-6 min-h-[600px]">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columnsWithCount.map(col => (
            <DroppableColumn key={col.key} status={col.key} columnConfig={col}>
              <div className="space-y-4">
                {issues.filter(i => i.status === col.key).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl opacity-20 mb-2">📋</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có issue nào</p>
                  </div>
                )}
                {issues.filter(i => i.status === col.key).map(issue => {
                  const typeConfig = getIssueTypeConfig(issue.issueType);
                  const priorityConfig = getPriorityConfig(issue.priority);
                  const TypeIcon = typeConfig.icon;
                  
                  return (
                    <DraggableIssue key={issue.id} issue={issue}>
                      <Card className="group p-3 cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:scale-105 hover:bg-white dark:hover:bg-gray-800">
                        <div className="flex items-start gap-3 mb-2">
                          <Badge className={`bg-gradient-to-r ${typeConfig.gradient} ${typeConfig.textColor} text-xs flex items-center gap-1.5 px-2 py-1 font-semibold shadow-lg`}>
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig.label}
                          </Badge>
                          <Badge 
                            className={`${priorityConfig.color} ${priorityConfig.text} text-xs px-2 py-1 font-bold shadow-md ${priorityConfig.pulse}`}
                          >
                            {issue.priority}
                          </Badge>
                          {onCreateSubtask && issue.issueType !== "SUBTASK" && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onCreateSubtask(issue);
                              }}
                              title="Tạo subtask"
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-full shadow-lg"
                            >
                              <Zap className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        <Link 
                          to={`/issues/${issue.id}`}
                          className="font-bold text-base mb-2 hover:text-primary transition-colors cursor-pointer group-hover:underline text-gray-800 dark:text-gray-200 line-clamp-2"
                        >
                          {issue.title}
                        </Link>
                        
                        {issue.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 leading-relaxed">
                            {issue.description}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          {issue.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {issue.assignee.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {issue.assignee.name}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-xs">?</span>
                              </div>
                              <span className="text-sm">Chưa giao</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            <Target className="h-3 w-3" />
                            {issue.id.slice(-6)}
                          </div>
                        </div>
                      </Card>
                    </DraggableIssue>
                  );
                })}
                
                {col.key === "TO_DO" && canCreateIssue && onOpenCreateIssue && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      size="lg" 
                      onClick={onOpenCreateIssue}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      ✨ Tạo Issue mới
                    </Button>
                  </div>
                )}
              </div>
            </DroppableColumn>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard; 