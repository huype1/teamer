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
    <div className="border-b">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full h-12 bg-transparent border-b-0" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground rounded-none h-full"
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