import React from "react";
import type { Issue } from '@/types/issue';
import type { ProjectMember } from '@/types/project';
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Bug, FileText, Layers, Target, Zap } from "lucide-react";

interface KanbanBoardProps {
  issues: Issue[];
  projectMembers: ProjectMember[];
  onOpenCreateIssue?: () => void;
  canCreateIssue?: boolean;
  onStatusChange?: (issueId: string, newStatus: string) => void;
}

const STATUS_COLUMNS = [
  { key: "TO_DO", label: "Cần làm" },
  { key: "IN_PROGRESS", label: "Đang làm" },
  { key: "IN_REVIEW", label: "Chờ review" },
  { key: "DONE", label: "Hoàn thành" },
];

const getIssueTypeConfig = (issueType: string) => {
  switch (issueType) {
    case "EPIC":
      return {
        icon: Layers,
        color: "issue-type-epic",
        label: "Epic"
      };
    case "STORY":
      return {
        icon: FileText,
        color: "issue-type-story",
        label: "Story"
      };
    case "TASK":
      return {
        icon: Target,
        color: "issue-type-task",
        label: "Task"
      };
    case "BUG":
      return {
        icon: Bug,
        color: "issue-type-bug",
        label: "Bug"
      };
    case "SUBTASK":
      return {
        icon: Zap,
        color: "issue-type-subtask",
        label: "Subtask"
      };
    default:
      return {
        icon: Target,
        color: "issue-type-task",
        label: "Task"
      };
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
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

function DroppableColumn({ status, children }: { status: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });
  return (
    <div
      ref={setNodeRef}
      className={
        `min-w-[160px] w-48 flex-shrink-0 transition-colors rounded-lg border ` +
        (isOver ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/10')
      }
      style={{ minHeight: '180px' }}
    >
      {children}
    </div>
  );
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ issues, onOpenCreateIssue, canCreateIssue, onStatusChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STATUS_COLUMNS.map(col => (
          <DroppableColumn key={col.key} status={col.key}>
            <div className="font-semibold text-lg mb-2 flex items-center gap-2">
              {col.label}
              <Badge variant="secondary">{issues.filter(i => i.status === col.key).length}</Badge>
            </div>
            <div className="space-y-3">
              {issues.filter(i => i.status === col.key).length === 0 && (
                <div className="text-muted-foreground text-sm text-center py-4">Không có issue</div>
              )}
              {issues.filter(i => i.status === col.key).map(issue => {
                const typeConfig = getIssueTypeConfig(issue.issueType);
                const TypeIcon = typeConfig.icon;
                return (
                  <DraggableIssue key={issue.id} issue={issue}>
                    <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2 mb-2">
                        <Badge className={`${typeConfig.color} text-xs flex items-center gap-1`}>
                          <TypeIcon className="h-3 w-3" />
                          {typeConfig.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{issue.priority}</Badge>
                      </div>
                      <div className="font-medium text-base mb-1">{issue.title}</div>
                      <div className="text-xs text-muted-foreground mb-1 line-clamp-2">{issue.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {issue.assignee && (
                          <span className="text-xs">👤 {issue.assignee.name}</span>
                        )}
                      </div>
                    </Card>
                  </DraggableIssue>
                );
              })}
              {col.key === "TO_DO" && canCreateIssue && onOpenCreateIssue && (
                <div className="flex justify-center pt-2">
                  <Button size="sm" variant="outline" onClick={onOpenCreateIssue}>
                    + Tạo Issue mới
                  </Button>
                </div>
              )}
            </div>
          </DroppableColumn>
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard; 