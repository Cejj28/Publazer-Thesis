import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Library, FileCheck, Users, AlertCircle, Eye, Check, X } from 'lucide-react';
import { getPapers, updatePaperStatus } from '@/lib/api';
import { toast } from 'sonner';

interface ResearchPaper {
  _id: string;
  title: string;
  author: string;
  uploadDate: string;
  status: string;
  fileName: string;
}

export default function Dashboard() {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();
  const [pendingPapers, setPendingPapers] = useState<ResearchPaper[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  // 1. Fetch Data on Load
  const loadDashboardData = async () => {
    try {
      // Get ALL papers to calculate stats
      const allPapers: ResearchPaper[] = await getPapers({});
      
      setStats({
        total: allPapers.length,
        pending: allPapers.filter(p => p.status === 'pending').length,
        approved: allPapers.filter(p => p.status === 'approved').length,
      });

      // If Faculty, filter for the "To Review" list
      if (hasRole('faculty') || hasRole('admin')) {
        setPendingPapers(allPapers.filter(p => p.status === 'pending'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  // 2. Handle Approve/Reject
  const handleReview = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updatePaperStatus(id, newStatus);
      toast.success(`Paper ${newStatus} successfully`);
      loadDashboardData(); // Refresh the list instantly
    } catch (error) {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  // --- STAT CARDS Logic ---
  const getStatCards = () => {
    if (hasRole('faculty')) {
      return [
        { label: 'Papers to Review', value: stats.pending, icon: AlertCircle, color: 'text-orange-500' },
        { label: 'Total Repository', value: stats.approved, icon: Library, color: 'text-blue-500' },
        { label: 'Total Uploads', value: stats.total, icon: Users, color: 'text-gray-500' },
      ];
    }
    // Default Student Stats
    return [
      { label: 'Total Repository', value: stats.approved, icon: Library, color: 'text-primary' },
      { label: 'My Uploads', value: 'View', icon: Upload, color: 'text-blue-500', action: () => navigate('/my-submissions') },
    ];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            {hasRole('faculty') 
              ? "You have papers waiting for your review." 
              : "Explore the research repository or submit your work."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getStatCards().map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={stat.action}>
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

        {/* --- FACULTY ONLY: PENDING REVIEWS LIST --- */}
        {(hasRole('faculty') || hasRole('admin')) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Pending Reviews
            </h2>
            
            {pendingPapers.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No papers currently pending review. Good job!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingPapers.map((paper) => (
                  <Card key={paper._id}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{paper.title}</h3>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted by <span className="font-medium text-foreground">{paper.author}</span> on {new Date(paper.uploadDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`http://localhost:3001/uploads/${paper.fileName}`} target="_blank" rel="noreferrer">
                            <Eye className="w-4 h-4 mr-2" />
                            View PDF
                          </a>
                        </Button>
                        
                        <div className="h-8 w-px bg-border hidden md:block" />
                        
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleReview(paper._id, 'approved')}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReview(paper._id, 'rejected')}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}