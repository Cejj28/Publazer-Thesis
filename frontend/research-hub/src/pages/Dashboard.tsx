import { useAuth } from '@/hooks/useAuth'; // Imports our new hook
import { DashboardLayout } from '@/components/layout/DashboardLayout'; // Ensure you have this component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Library, FileCheck, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  // Get the real data from our hook
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();

  // --- STATS (These are still static for now) ---
  const studentStats = [
    { label: 'Uploaded Papers', value: '3', icon: Upload, color: 'text-primary' },
    { label: 'Pending Review', value: '1', icon: AlertCircle, color: 'text-yellow-500' }, // Changed to Tailwind color class
    { label: 'Approved Papers', value: '2', icon: FileCheck, color: 'text-green-500' },
  ];

  const facultyStats = [
    { label: 'Papers to Review', value: '12', icon: FileCheck, color: 'text-primary' },
    { label: 'Total Repository', value: '248', icon: Library, color: 'text-blue-500' },
    { label: 'Reviewed This Month', value: '8', icon: TrendingUp, color: 'text-green-500' },
  ];

  const adminStats = [
    { label: 'Total Users', value: '156', icon: Users, color: 'text-primary' },
    { label: 'Total Papers', value: '248', icon: Library, color: 'text-blue-500' },
    { label: 'Plagiarism Alerts', value: '4', icon: AlertCircle, color: 'text-red-500' },
    { label: 'Approved Papers', value: '230', icon: FileCheck, color: 'text-green-500' },
  ];

  const getStats = () => {
    // We check roles safely
    if (hasRole('admin')) return adminStats;
    if (hasRole('faculty')) return facultyStats;
    return studentStats; // Default to student
  };

  const quickActions = [
    hasRole('student') && {
      title: 'Upload Research Paper',
      description: 'Submit your research for plagiarism check',
      action: () => navigate('/upload'),
      icon: Upload,
    },
    {
      title: 'Browse Repository',
      description: 'View all available research papers',
      action: () => navigate('/repository'),
      icon: Library,
    },
    // Only show "Check Plagiarism" if you actually have a page for it
    {
      title: 'Check Plagiarism',
      description: 'View plagiarism detection results',
      action: () => navigate('/plagiarism'),
      icon: FileCheck,
    },
    hasRole('admin') && {
      title: 'Manage Users',
      description: 'Add, edit, or remove users',
      action: () => navigate('/users'),
      icon: Users,
    },
  ].filter(Boolean); // Removes the "false" entries

  // Prevent crash: Don't render until we know who the user is
  if (loading) {
    return <div className="p-10 text-center">Loading Dashboard...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {/* Display the REAL name from MongoDB */}
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your research today.
          </p>
          {user?.department && (
            <p className="text-sm text-primary font-medium mt-1">
              Department: {user.department}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {getStats().map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action: any, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary group"
                onClick={action.action}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}