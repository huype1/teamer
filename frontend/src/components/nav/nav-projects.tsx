import {
  Folder,
  Plus,
  ChevronRight,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import projectService from "@/service/projectService"
import type { Project } from "@/types/project"
import { useState, useCallback } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function NavProjects() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await projectService.getProjects();
      const fetchedProjects = res.result || []
      setProjects(fetchedProjects)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (open && projects.length === 0 && !loading) {
      fetchProjects()
    }
  }, [open, projects.length, loading, fetchProjects])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Dự án</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          asChild
          open={isOpen}
          onOpenChange={handleOpenChange}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Projects">
                <Folder className="w-4 h-4" />
                <span>Dự án của tôi</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {loading ? (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>
                      <LoadingSpinner size="sm" />
                      <span>Đang tải dự án...</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ) : projects.length === 0 ? (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      onClick={() => navigate("/projects")}
                      className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tạo dự án đầu tiên</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ) : (
                  <>
                    {projects.map((project) => {
                      const isActive = location.pathname === `/projects/${project.id}`
                      
                      return (
                        <SidebarMenuSubItem key={project.id}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isActive}
                            onClick={() => {
                              navigate(`/projects/${project.id}`)
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                                {project.key}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-medium text-sm">{project.name}</div>
                              </div>
                            </div>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton 
                        asChild
                        onClick={() => navigate("/projects")}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Plus className="w-4 h-4 text-sidebar-foreground/70" />
                          <span className="text-sidebar-foreground/70">Tạo dự án</span>
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )

}
