import * as React from "react"
import { Users, Plus, Settings, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import teamService from "@/service/teamService"
import type { Team } from "@/components/nav/team"

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
      const res = await teamService.getTeamByUserId(user.id)
      const fetchedTeams = res.result || []
      setTeams(fetchedTeams)
      if (fetchedTeams.length > 0) {
        setIsOpen(true)
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  React.useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  if (loading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Teams</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Loading teams...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  if (teams.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Teams</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate("/teams")}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first team</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Teams</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          asChild
          open={isOpen}
          onOpenChange={setIsOpen}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Teams">
                <Users className="w-4 h-4" />
                <span>My Teams</span>
                <span className="ml-auto text-xs text-sidebar-foreground/70">
                  {teams.length}
                </span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {teams.map((team) => (
                  <SidebarMenuSubItem key={team.id}>
                    <SidebarMenuSubButton 
                      asChild 
                      onClick={() => {
                        console.log("Selected team:", team.name)
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium text-sm">{team.name}</div>
                          <div className="truncate text-xs text-sidebar-foreground/70 h-full">
                            {team.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
                <SidebarMenuSubItem>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    asChild
                    onClick={() => navigate("/teams")}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Settings className="w-4 h-4 text-sidebar-foreground/70" />
                      <span className="text-sidebar-foreground/70">Manage teams</span>
                    </div>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
