
import './App.css'
import {LoginForm} from "@/components/login-form.tsx";
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";

function App() {

  return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <SidebarProvider >
              <AppSidebar />
          </SidebarProvider>
          <div className="flex w-full max-w-sm flex-col gap-6">
              <LoginForm />
          </div>
      </div>
  )
}

export default App
