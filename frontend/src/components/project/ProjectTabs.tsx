import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ProjectTab {
  key: string;
  label: string;
}

interface ProjectTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  tabs: ProjectTab[];
  children: React.ReactNode;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  activeTab,
  onTabChange,
  tabs,
  children
}) => {
  return (
    <div className="space-y-3">
      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-3">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}; 