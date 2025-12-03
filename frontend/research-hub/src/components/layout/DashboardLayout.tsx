import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react'; // Removed unused X import
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* 1. DESKTOP SIDEBAR (Hidden on Mobile) */}
      <div className="hidden md:block fixed inset-y-0 z-50 w-64 border-r border-border bg-card">
        <Sidebar />
      </div>

      {/* 2. MAIN CONTENT AREA */}
      {/* 'md:pl-64' pushes content to the right on desktop to make room for sidebar */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen w-full transition-all duration-300 ease-in-out">
        
        {/* 3. MOBILE HEADER (Hidden on Desktop) */}
        <header className="md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 flex items-center gap-4 h-16">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            {/* 4. MOBILE SIDEBAR (Slide-out Drawer) */}
            <SheetContent side="left" className="p-0 w-64 border-r bg-card">
              {/* Pass a close handler if your Sidebar component supports it, or rely on default link behavior closing the sheet if implemented */}
              <Sidebar /> 
            </SheetContent>
          </Sheet>
          <h1 className="font-bold text-lg">Publazer</h1>
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