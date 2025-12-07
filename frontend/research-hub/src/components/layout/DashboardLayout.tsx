import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationBell } from '@/components/NotificationBell'; 

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden md:block fixed inset-y-0 z-50 w-64 border-r border-border bg-card">
        <Sidebar />
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen w-full transition-all duration-300 ease-in-out">
        
        {/* --- DESKTOP HEADER (NEW) --- */}
        <header className="hidden md:flex sticky top-0 z-40 border-b bg-background/95 backdrop-blur px-8 h-16 items-center justify-end gap-4">
           {/* You can add user profile dropdown here later too */}
           <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-muted-foreground">Alerts</span>
             <NotificationBell />
           </div>
        </header>

        {/* --- MOBILE HEADER (UPDATED) --- */}
        <header className="md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur p-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r bg-card">
                <Sidebar /> 
              </SheetContent>
            </Sheet>
            <h1 className="font-bold text-lg">Publazer</h1>
          </div>
          
          {/* Add Bell to Mobile Header too */}
          <NotificationBell />
        </header>

        {/* 5. PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};