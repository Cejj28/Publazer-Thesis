import { useAuth } from '@/hooks/useAuth';
import { NavLink } from '@/components/NavLink';
import { UserRole } from '@/lib/auth';
import {
  LayoutDashboard,
  Upload,
  Library,
  FileCheck,
  Users,
  LogOut,
  UserCog 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// 1. Import your logo here
import logoImage from '../../assets/ustp.png';

export const Sidebar = () => {
  const { user, logout, hasAnyRole } = useAuth();

  const navItems: { label: string; icon: any; href: string; roles: UserRole[] }[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['student', 'faculty', 'admin'],
    },
    {
      label: 'My Submissions',
      icon: Upload,
      href: '/my-submissions',
      roles: ['student'],
    },
    {
      label: 'Upload Research',
      icon: Upload,
      href: '/upload',
      roles: ['student'],
    },
    {
      label: 'Repository',
      icon: Library,
      href: '/repository',
      roles: ['student', 'faculty', 'admin'],
    },
    {
      label: 'Check Plagiarism',
      icon: FileCheck,
      href: '/check-plagiarism',
      roles: ['student', 'faculty', 'admin'],
    },
    {
      label: 'Plagiarism Reports',
      icon: FileCheck,
      href: '/plagiarism',
      roles: ['student', 'faculty', 'admin'],
    },
    {
      label: 'User Management',
      icon: Users,
      href: '/users',
      roles: ['admin'],
    },
    {
      label: 'My Profile',
      icon: UserCog,
      href: '/profile',
      roles: ['student', 'faculty', 'admin'], 
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          {/* 2. Replaced BookOpen icon with your Logo Image */}
          <img 
            src={logoImage} 
            alt="Logo" 
            className="w-10 h-10 object-contain drop-shadow-sm"
          />
          <div>
            <h1 className="font-bold text-lg text-foreground leading-tight">PUBLAZER</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Repository System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          if (!hasAnyRole(item.roles)) return null;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-smooth"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="mb-3 p-3 bg-secondary rounded-lg">
          <p className="text-sm font-semibold text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-primary font-medium mt-1 capitalize">
            {user?.role}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out of your session?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={logout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
};