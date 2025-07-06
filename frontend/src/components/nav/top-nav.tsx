

import { useState } from "react"
import { Search, Settings, Bell, Plus, Moon, Sun, GanttChartSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useTheme } from "@/components/ui/theme-provider"
import { useSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"
import type { RootState } from "@/store"
import { useNavigate } from "react-router-dom"

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

interface TopNavProps {
  variant?: "full" | "simple"
  onSearch?: (query: string) => void
  onSettings?: () => void
  onNotifications?: () => void
  onCreate?: () => void
  onLogout?: () => void
}

export function TopNav({
  variant = "full",
  onSearch,
  onSettings,
  onNotifications,
  onCreate,
  onLogout,
}: TopNavProps) {
  const { setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.name && <p className="font-medium">{user.name}</p>}
            {user?.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const ThemeDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <a href="/" className="flex items-center space-x-2 mr-8">
          <GanttChartSquare className="h-6 w-6" />
          <span className="font-bold text-lg">Teamer</span>
        </a>
        
        {variant === "full" && user && (
          <>
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
                />
              </form>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              {/* <Button variant="ghost" size="icon" onClick={onNotifications} className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">3</span>
              </Button> */}
              <Button variant="ghost" size="icon" onClick={onSettings} className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
              <UserDropdown />
            </div>
          </>
        )}

        {variant === "simple" && (
          <nav className="flex items-center space-x-2 ml-auto">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                <UserDropdown />
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>Đăng nhập</Button>
                <Button onClick={() => navigate("/register")}>Đăng ký</Button>
              </>
            )}
          </nav>
        )}
        
        <ThemeDropdown />
      </div>
    </header>
  )
} 