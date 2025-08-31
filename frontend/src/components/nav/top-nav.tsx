import { useState } from "react"
import { Search, Moon, Sun, SquareDashedKanban, Menu, X } from "lucide-react"
import NotificationBell from "@/components/ui/notification-bell"
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
  onSettings?: () => void
  onNotifications?: () => void
  onCreate?: () => void
  onLogout?: () => void
}

export function TopNav({
  variant = "full",
  onLogout,
}: TopNavProps) {
  const { setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
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
            <AvatarFallback className="text-xs">{getInitials(user?.name || 'User')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.name ? (
              <p className="font-medium truncate">{user.name}</p>
            ) : (
              <p className="font-medium text-muted-foreground">Loading...</p>
            )}
            {user?.email ? (
              <p className="w-[180px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            ) : (
              <p className="w-[180px] truncate text-sm text-muted-foreground">
                Loading email...
              </p>
            )}
            {user?.bio && (
              <p className="w-[180px] truncate text-xs text-muted-foreground mt-1">
                {user.bio}
              </p>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {user?.projectMembers ? (
                <p>Projects: {user.projectMembers.length}</p>
              ) : (
                <p>Projects: Loading...</p>
              )}
              {user?.teamMembers ? (
                <p>Teams: {user.teamMembers.length}</p>
              ) : (
                <p>Teams: Loading...</p>
              )}
            </div>
          </div>
        </div>
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          Hồ sơ cá nhân
        </DropdownMenuItem>
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
    <header className="sticky top-0 z-99 w-full border-b bg-card  px-2 sm:px-3">
      <div className="flex h-14 items-center justify-between w-full max-w-screen-2xl mx-auto">
        {/* Logo - Always visible */}
        <div className="flex items-center">
          <div onClick={() => navigate("/")} className="flex items-center space-x-2 flex-shrink-0">
            <SquareDashedKanban className="h-5 w-5 sm:h-6 sm:w-6"/>
            <h1>Teamer</h1>
          </div>
        </div>

        {variant === "full" && (
          <>
                         {/* Desktop Search Bar */}
             <div className="hidden md:flex flex-1 max-w-sm mx-4 lg:mx-8">
               <form onSubmit={handleSearch} className="relative w-full flex gap-2">
                 <div className="relative flex-1">
                   {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /> */}
                   <Input
                     type="text"
                     placeholder="Tìm kiếm..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring w-full"
                   />
                 </div>
                 <Button 
                   type="submit" 
                   className="bg-primary hover:bg-primary/90 text-primary-foreground px-3"
                   disabled={!searchQuery.trim()}
                 >
                   <Search className="h-4 w-4" />
                 </Button>
               </form>
             </div>

                         {/* Mobile Search Toggle */}
             <div className="md:hidden">
               {isSearchOpen ? (
                 <div className="absolute top-14 left-0 right-0 p-2 bg-background border-b z-40">
                   <form onSubmit={handleSearch} className="relative flex gap-2">
                     <div className="relative flex-1">
                       {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /> */}
                       <Input
                         type="text"
                         placeholder="Tìm kiếm..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring w-full"
                         autoFocus
                       />
                     </div>
                     <Button 
                       type="submit" 
                       className="bg-primary hover:bg-primary/90 text-primary-foreground px-3"
                       disabled={!searchQuery.trim()}
                     >
                       <Search className="h-4 w-4" />
                     </Button>
                     <Button
                       type="button"
                       variant="ghost"
                       size="icon"
                       className="h-10 w-10"
                       onClick={() => setIsSearchOpen(false)}
                     >
                       <X className="h-4 w-4" />
                     </Button>
                   </form>
                 </div>
               ) : null}
             </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-1 lg:space-x-2">
              <NotificationBell />
              {/* <Button variant="ghost" size="icon" onClick={onSettings} className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button> */}
              <UserDropdown />
              <ThemeDropdown />
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center space-x-1">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-8 w-8"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="absolute top-14 right-0 w-48 bg-background border border-border rounded-md shadow-lg z-40 sm:hidden">
                <div className="p-2 space-y-1">
                  {/* <Button variant="ghost" size="sm" onClick={onSettings} className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button> */}
                  <div className="px-2 py-1">
                    <UserDropdown />
                  </div>
                  <div className="px-2 py-1">
                    <ThemeDropdown />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {variant === "simple" && (
          <>
            {/* Desktop Simple Nav */}
            <nav className="hidden sm:flex items-center space-x-2">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-sm">
                    Dashboard
                  </Button>
                  <UserDropdown />
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")} className="text-sm">
                    Đăng nhập
                  </Button>
                  <Button onClick={() => navigate("/register")} className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                    Đăng ký
                  </Button>
                </>
              )}
              <ThemeDropdown />
            </nav>

            {/* Mobile Simple Nav */}
            <div className="flex sm:hidden items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-8 w-8"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {/* Mobile Simple Menu */}
            {isMobileMenuOpen && (
              <div className="absolute top-14 right-0 w-48 bg-background border border-border rounded-md shadow-lg z-40 sm:hidden">
                <div className="p-2 space-y-1">
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard")}
                        className="w-full justify-start"
                      >
                        Dashboard
                      </Button>
                      <div className="px-2 py-1">
                        <UserDropdown />
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/login")}
                        className="w-full justify-start"
                      >
                        Đăng nhập
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate("/register")}
                        className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Đăng ký
                      </Button>
                    </>
                  )}
                  <div className="px-2 py-1">
                    <ThemeDropdown />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  )
}
