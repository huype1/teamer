import * as React from "react"
import { Users, Plus, Settings, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import teamService from "@/service/teamService"
import type { Team } from "@/types/team"
import { useEffect } from "react"

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

export function TeamSwitcher() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [teams, setTeams] = React.useState<Team[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  const fetchTeams = React.useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await teamService.getTeams("");
      const fetchedTeams = res.result || []
      setTeams(fetchedTeams)
    } catch (error) {
      console.error("Failed to fetch teams:", error)
      setTeams([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open)
    if (open && teams.length === 0 && !loading) {
      fetchTeams()
    }
  }, [teams.length, loading, fetchTeams])

  useEffect(() => {
    if (user?.id) {
      fetchTeams()
    }
  }, [user?.id, fetchTeams])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Nhóm</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          asChild
          open={isOpen}
          onOpenChange={handleOpenChange}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Teams">
                <Users className="w-4 h-4" />
                <span>Nhóm của tôi</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {loading ? (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8B5CF6]"></div>
                      <span>Đang tải nhóm...</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ) : teams.length === 0 ? (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      onClick={() => navigate("/teams")}
                      className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tạo nhóm đầu tiên</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ) : (
                  <>
                    {teams.map((team) => (
                      <SidebarMenuSubItem key={team.id}>
                        <SidebarMenuSubButton 
                          asChild 
                          onClick={() => {
                            navigate(`/teams/${team.id}`)
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                              {team.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium text-sm">{team.name}</div>
                            </div>
                          </div>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton 
                        asChild
                        onClick={() => navigate("/teams")}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Settings className="w-4 h-4 text-sidebar-foreground/70" />
                          <span className="text-sidebar-foreground/70">Quản lý nhóm</span>
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
